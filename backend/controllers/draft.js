let clients = []
let streamsOn = false
let timers = []
const Draft = require('../models/draft')
const User = require('../models/user')

/**
 * 
 * @param {*} ws 
 * @param {*} req 
 * 
 * At the moment you can access this with a single user on a single device
 * Multiple devices not supported, because the client is dropped from the clients array
 */

const draftRouter = async (ws, req) => {
  const clientId = req.params.clientId
  const draftId = req.params.draftId
  const webSocketKey = req.headers['sec-websocket-key']
  console.log('web socket connection opened for', clientId, draftId, webSocketKey)

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
  

  /* // NOT working with express-ws
  ws.on('connection', () => {
    console.log('client connected', msg)
    ws.send('heippaa')
  })
  */

  ws.on('message', async function(msg) {
    // console.log(msg)
    
    const broadcastRegex = /^broadcast\:/
    const teamChosenRegex = /^teamChosen\:/

    if (broadcastRegex.test(msg)) {
      msg = msg.replace(broadcastRegex, '')

      //send back the message to the other clients
      clients[draftId]
        .forEach(client => {
          // console.log(client.user, client.id)
          if (client.ws !== ws) {
              client.ws.send(`Hello, broadcast message -> ${msg}`)
          } else {
            console.log('not broadcasting to itself')
          }
        })
        
    } else if (teamChosenRegex.test(msg)) {
      const teamId = msg.replace(teamChosenRegex, '')

      console.log('draft+team', draftId, teamId)

      pickATeam(draftId, teamId)
    } else {
      ws.send('you sent this: ' + msg)
    }
  })

  ws.on('close', () => {
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
  })

  ws.on('request', (request) => {
    console.log('new request!', request)
  })


  // STREAM WATCH STARTS HERE
  if (!streamsOn) {
    try {
      streamsOn = true
      console.log('starting watch')
      
      const changeStream = Draft.watch()

      changeStream.on('change', async (change) => {
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

            /*
            if (change.updateDescription && 
                change.updateDescription.updatedFields.status === 'started') {
              console.log(change.documentKey._id, 'draft started')
              console.log(change.updateDescription.updatedFields.draftOrder)
              startTimer(change.documentKey._id, change.updateDescription.updatedFields.draftOrder[0])
            }
            */

            clients[change.documentKey._id].forEach(client => {
              client.ws.send('change:' + JSON.stringify(newDraft))
            })
          } else {
            ws.send(`Hello, some other db was changed`)
          } 
      })
    } catch(e) {
      console.log('fucked up', e)
    }
  }

  const startTimer = (draftId, playerInTurn) => {
    console.log('startTimer called', draftId, playerInTurn)
    timers[draftId] = setTimeout(() => {
      pickATeam(draftId, null, playerInTurn)
    }, (3 * 1000))
  }

  const pickATeam = async (draftId, teamId, playerInTurn = clientId) => {
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
        startTimer(draft._id, draft.draftOrder[0])
      }

      await draft.save()
    }
  }

  const forceStreamsOn = () => {
    if (!streamsOn) {
      streamsOn = true
    }
  }
  
}

module.exports = draftRouter