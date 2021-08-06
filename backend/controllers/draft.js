let clients = []
let streamsOn = false
const Draft = require('../models/draft')
const mongoose = require('mongoose')

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
      console.log(clients)
    } else {
      console.log('connection already open with that web socket key')
      console.log(clients)
    }


    if (!clients[draftId].find(u => u.user === clientId)) {
      console.log(`adding ${clientId} to ${draftId}`)
      clients[draftId].push({ 
        user: clientId, 
        ws: ws,
        id: webSocketKey
      })
      console.log(clients)
    } else if (clients[draftId].find(u => u.id === webSocketKey)) {
      console.log('found')
    } else {
      console.log('draft or user not found -> not adding to array')
      console.log(clients)
    }
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
    ws.send('heippa')
  })
  */

  ws.on('message', function(msg) {
    console.log(msg)
    
    const broadcastRegex = /^broadcast\:/
    const teamChosenRegex = /^teamChosen\:/

    if (broadcastRegex.test(msg)) {
      msg = msg.replace(broadcastRegex, '')

      //send back the message to the other clients
      clients[draftId]
        .forEach(client => {
          console.log(client.user, client.id)
          if (client.ws !== ws) {
              client.ws.send(`Hello, broadcast message -> ${msg}`)
          } else {
            console.log('not broadcasting to itself')
          }
        })
        
    } else if (teamChosenRegex.test(msg)) {
      clients[draftId]
        .forEach(client => {
          console.log(client.user, client.id)
          if (client.ws !== ws) {
              client.ws.send(`Team chosen -> ${msg}`)
          } else {
            console.log('not broadcasting to itself')
          }
        })
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

  if (!streamsOn) {
    try {
      streamsOn = true
      console.log('starting watch')
      
      const changeStream = Draft.watch()

      changeStream.on('change', (change) => {
          console.log('db changed', change.documentKey._id)
          //console.log(clients)

          if (clients[change.documentKey._id]) {
            clients[change.documentKey._id].forEach(client => {

              /**
              if (client.ws !== ws) {
                client.ws.send(`Hello, database changed -> ${JSON.stringify(change.updateDescription)}`)
              } else {
                console.log('not broadcasting to itself')
              } 
              */
              // client.ws.send(`Hello, database changed -> ${JSON.stringify(change.updateDescription)}`)
              client.ws.send('change:' + JSON.stringify(change))
            })
          } else {
            ws.send(`Hello, some other db was changed`)
          }
          
          /*
          clients
              .forEach(client => {
                  if (client != ws) {
                      client.client.send(`Hello, broadcast message -> ${JSON.stringify(change.updateDescription)}`);
                  }    
              })
          */    
      })
    } catch(e) {
      console.log('fucked up', e)
    }
  }
  
  
  
}

module.exports = draftRouter