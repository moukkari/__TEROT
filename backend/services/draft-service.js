const Draft = require('../models/draft')
const GameGroup = require('../models/gameGroup')
const User = require('../models/user')
const mongoose = require('mongoose')
const scheduler = require('node-schedule')

let clients = []
let streamsOn = false
let timers = []

const initialize = () => {
  try {
    console.log('starting draft collection watch')
    const changeStream = Draft.watch()

    changeStream.on('change', async (change) => {
      // Force start draft
      if (change.updateDescription && change.updateDescription.updatedFields.status === 'started') {
        console.log(change.documentKey._id, 'draft started')
        console.log(change.updateDescription.updatedFields.draftOrder)
        startTimer(change.documentKey._id, change.updateDescription.updatedFields.draftOrder[0])
      }

      if (change.updateDescription && change.updateDescription.updatedFields.startingTime) {
        console.log(`draft ${change.documentKey._id} changed starting time to 
          ${change.updateDescription.updatedFields.startingTime}`)
        scheduleDraft(change.documentKey._id, change.updateDescription.updatedFields.startingTime)
      } else {
        console.log('db changed', change.documentKey._id)

        if (clients[change.documentKey._id]) {
          const newDraft = await Draft.findOne({ _id: change.documentKey._id })
            .populate('draftOrder', { name: 1, username: 1 })
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

          

          clients[change.documentKey._id].forEach(client => {
            client.ws.send('change:' + JSON.stringify(newDraft))
          })
        } else {
          console.log('no clients listening')
        } 
      }
    })
  } catch(e) {
    console.log('fucked up', e)
  }
}

const scheduleDraft = async (draftId, startingTime) => {
  console.log(`scheduling Draft ${draftId} to start at ${startingTime}`)
  let startingDate = new Date() // CHANGE TO startingTime
  startingDate.setSeconds(startingDate.getSeconds() + 5)

  const job = scheduler.scheduleJob(startingDate, async () => {
    console.log('job started')

    const draft = await Draft.findById(draftId)
    draft.status = 'started'

    const gameGroup = await GameGroup.findOne({ draft: draftId })
      .populate('players', 'name')
    
    draft.draftOrder = await shuffle(gameGroup.players)
    draft.totalRounds = Math.floor(draft.teamsLeft.length / gameGroup.players.length)

    draft.picksPerRound = Math.floor(draft.teamsLeft.length / draft.totalRounds)

    await draft.save()

    console.log('done scheduling')
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
      console.log('connection already open with that web socket key')
    }


    if (!clients[draftId].find(u => u.user === clientId)) {
      console.log(`adding ${clientId} to ${draftId}`)
      clients[draftId].push({ 
        user: clientId, 
        ws: ws,
        id: webSocketKey
      })
    } else if (clients[draftId].find(u => u.id === webSocketKey)) {
      console.log('found the user')
    } else {
      console.log('draft or user not found -> not adding to array')
    }
    console.log(clients)
  } else {
    clients[draftId] = [{ 
      user: clientId, 
      ws: ws,
      id: webSocketKey
    }]
    console.log(clients)
  }
}

const broadcast = (msg, draftId, ws) => {

  //send back the message to the other clients
  clients[draftId]
    .forEach(client => {
      console.log(client.user, client.id)
      if (client.ws !== ws) {
        console.log('trying to broadcast')
        client.ws.send(`Hello, broadcast message -> ${msg}`)
      } else {
        console.log('not broadcasting to itself')
      }
    })
}

const close = (draftId, ws) => {
  if (clients[draftId]) {
    let toFind = clients[draftId].find(client => client.ws === ws)
    if (toFind) {
      clients[draftId] = clients[draftId].filter(client => client !== toFind)
    } else {
      console.log('client not found')
    }
  }
  console.log('WebSocket was closed')
  console.log(clients)
}

const startTimer = async (draftId, playerInTurn, timeForTakingPick) => {
  if (!timeForTakingPick) {
    let d = await Draft.findOne({ _id: draftId })
    timeForTakingPick = d.timeForTakingPick
  }
  console.log('startTimer called', draftId, playerInTurn)
  timers[draftId] = setTimeout(() => {
    pickATeam(draftId, null, playerInTurn)
  }, (timeForTakingPick * 1000))
}

const pickATeam = async (draftId, teamId, playerInTurn) => {
  console.log('pickATeam', draftId, teamId, playerInTurn)
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
    console.log('teams left: ', draft.teamsLeft.length)
    teamId = draft.teamsLeft[Math.floor(Math.random() * draft.teamsLeft.length)]
  } else {
    console.log('closing timer for', playerInTurn)
    clearTimeout(timers[draftId])
  }

  if (draft && user) {
    await draft.teamsLeft.pull(teamId)

    await draft.teamsChosen.push({ team: teamId, user: user })

    let newArray = [...draft.draftOrder]
    newArray.push(newArray.shift())

    draft.pick++

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
    console.log('draft or user not found')
  }
}

const draftService = { initialize, checkForClient, broadcast, close, pickATeam }

module.exports = draftService