const Draft = require('../models/draft')
const GameGroup = require('../models/gameGroup')
const User = require('../models/user')
const scheduler = require('node-schedule')
const logger = require('../utils/logger')


let clients = []
let timers = []
let schedule = []

const initialize = () => {
  try {
    logger.info('starting draft collection watch')
    const changeStream = Draft.watch()

    changeStream.on('change', async (change) => {
      let updatedFields
      if (change.updateDescription) {
        updatedFields = change.updateDescription.updatedFields
      }
      
      const draftId = change.documentKey._id

      // Force draft start
      if (change.updateDescription && updatedFields.status === 'started') {
        logger.info(draftId, 'draft started')
        logger.info(updatedFields.draftOrder)
        startTimer(draftId, updatedFields.draftOrder[0])
      }

      if (change.updateDescription && updatedFields.startingTime) {
        logger.info(`draft ${draftId} changed starting time to 
          ${updatedFields.startingTime}`)
        scheduleDraft(draftId, updatedFields.startingTime)
      } else {
        logger.info('db changed', draftId)

        if (clients[draftId]) {
          const newDraft = await Draft.findOne({ _id: draftId })
            .populate('draftOrder', { name: 1, username: 1 })
            .populate('fullDraftOrder', { name: 1, username: 1 })
            .populate('teamsLeft', { City: 1, Name: 1, Key: 1 })
            .populate({
              path: 'teamsChosen', 
              populate: { 
                path: 'team',
                select: { City: 1, Name: 1, Key: 1 }
              }
            })
            .populate({
              path: 'teamsChosen', 
              populate: { 
                path: 'user',
                select: { name: 1 }
              }
            })

          clients[draftId].forEach(client => {
            client.ws.send('change:' + JSON.stringify(newDraft))
          })
        } else {
          logger.info('no clients listening')
        } 
      }
    })
  } catch(e) {
    logger.info('fucked up', e)
  }
}

const scheduleDraft = async (draftId, startingTime) => {
  logger.info(`scheduling Draft ${draftId} to start at ${startingTime}`)
  let startingDate = new Date(startingTime) // CHANGE TO startingTime
  //startingDate.setSeconds(startingDate.getSeconds() + 5) // REMOVE
  logger.info(new Date().toLocaleString(), new Date(startingTime).toLocaleString())

  schedule[draftId] = scheduler.scheduleJob(startingDate, async () => {
    logger.info('job started')

    const draft = await Draft.findById(draftId)
    draft.status = 'started'

    const gameGroup = await GameGroup.findOne({ draft: draftId })
      .populate('players', 'name')
    
    draft.draftOrder = await shuffle(gameGroup.players)
    draft.totalRounds = Math.floor(draft.teamsLeft.length / gameGroup.players.length)

    draft.picksPerRound = Math.floor(draft.teamsLeft.length / draft.totalRounds)

    let reverseOrder = [...draft.draftOrder].reverse()
    let arr = []
    for (let x = 0; x < draft.totalRounds; x++) {
      if (x % 2 !== 0) {
        arr = [...arr, ...reverseOrder]
      } else {
        arr = [...arr, ...draft.draftOrder]
      }
    }
    draft.fullDraftOrder = arr

    await draft.save()

    logger.info('done scheduling')
    delete schedule[draftId]
  })
}

const shuffle = (arr) => {
  let currentIndex = arr.length, randomIndex

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]

    return arr
  }
}

const checkForClient = (clientId, draftId, webSocketKey, ws) => {
  if (clients[draftId]) {
    let user = clients[draftId].find(u => u.id === webSocketKey)

    if (!user) {
      const newUser = { 
        user: clientId, 
        ws: ws,
        id: webSocketKey
      }

      user = clients[draftId].find(u => u.user === clientId)

      if (user) {
        clients[draftId] = clients[draftId].filter(u => u.user !== clientId)
      }

      clients[draftId].push(newUser)

    } else {
      logger.info('connection already open with that web socket key')
    }


    if (!clients[draftId].find(u => u.user === clientId)) {
      logger.info(`adding ${clientId} to ${draftId}`)
      clients[draftId].push({ 
        user: clientId, 
        ws: ws,
        id: webSocketKey
      })
    } else if (clients[draftId].find(u => u.id === webSocketKey)) {
      logger.info('found the user')
    } else {
      logger.info('draft or user not found -> not adding to array')
    }
    logger.info(clients)
  } else {
    clients[draftId] = [{ 
      user: clientId, 
      ws: ws,
      id: webSocketKey
    }]
    logger.info(clients)
  }
}

const broadcast = (msg, draftId, ws) => {

  //send back the message to the other clients
  clients[draftId]
    .forEach(client => {
      logger.info(client.user, client.id)
      if (client.ws !== ws) {
        logger.info('trying to broadcast')
        client.ws.send(`Hello, broadcast message -> ${msg}`)
      } else {
        logger.info('not broadcasting to itself')
      }
    })
}

const close = (draftId, ws) => {
  if (clients[draftId]) {
    let toFind = clients[draftId].find(client => client.ws === ws)
    if (toFind) {
      clients[draftId] = clients[draftId].filter(client => client !== toFind)
    } else {
      logger.info('client not found')
    }
  }
  logger.info('WebSocket was closed')
  logger.info(clients)
}

const startTimer = async (draftId, playerInTurn, timeForTakingPick) => {
  if (!timeForTakingPick) {
    let d = await Draft.findOne({ _id: draftId })
    timeForTakingPick = d.timeForTakingPick
  }
  logger.info('startTimer called', draftId, playerInTurn)
  timers[draftId] = setTimeout(() => {
    pickATeam(draftId, null, playerInTurn)
  }, (timeForTakingPick * 1000))
}

const pickATeam = async (draftId, teamId, playerInTurn) => {
  try {
    logger.info('closing timer for', playerInTurn)
    clearTimeout(timers[draftId])
  } catch {
    logger.error('no timer found')
  }

  logger.info('pickATeam', draftId, teamId, playerInTurn)
  let draft = await Draft.findOne({ _id: draftId })
  let user = await User.findOne({ _id: playerInTurn })

  // try to find user's prepicks
  let prePicks = await draft.prePicks.find(p => p.user.toString() === playerInTurn.toString())

  if (prePicks) {
    for (const pick of prePicks.picks) {
      const team = await draft.teamsLeft.find(t => t.toString() === pick.toString())
      
      if (team) {
        teamId = team
        break
      }
    }
  }

  if (!teamId) {
    logger.info('teams left: ', draft.teamsLeft.length)
    teamId = draft.teamsLeft[Math.floor(Math.random() * draft.teamsLeft.length)]
  }

  // check that it's actually player's turn
  const match = draft.draftOrder[0]._id.toString() === user._id.toString()
  console.log(match)

  if (draft && user && match) {
    await draft.teamsLeft.pull(teamId)

    await draft.teamsChosen.push({ team: teamId, user: user })

    let newArray = [...draft.draftOrder]
    newArray.push(newArray.shift())

    draft.pick++
    draft.totalPick++

    if (draft.pick > draft.picksPerRound) {
      draft.round++
      draft.pick = 1
      newArray.reverse()
    }

    draft.draftOrder = newArray

    if (draft.round > draft.totalRounds) {
      draft.status = 'finished'
    } else {
      startTimer(draft._id, draft.draftOrder[0], draft.timeForTakingPick)
    }

    await draft.save()
  } else {
    logger.error('draft or user not found')
    if (draft.draftOrder[0]._id !== user._id) {
      logger.error('player not in turn', draft.draftOrder[0]._id, user._id)
    }
  }
}

const draftService = { 
  initialize, 
  checkForClient, 
  broadcast, 
  close, 
  pickATeam 
}

module.exports = draftService