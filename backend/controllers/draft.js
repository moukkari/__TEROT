const draftService = require('../services/draft-service')
const logger = require('../utils/logger')

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
  logger.info('web socket connection opened for', clientId, draftId, webSocketKey)

  draftService.checkForClient(clientId, draftId, webSocketKey, ws)

  /* // NOT working with express-ws
  ws.on('connection', () => {
    logger.info('client connected', msg)
    ws.send('heippaa')
  })
  */

  ws.on('message', async function(msg) {
    // logger.info(msg)
    
    const broadcastRegex = /^broadcast:/
    const teamChosenRegex = /^teamChosen:/

    if (broadcastRegex.test(msg)) {
      msg = msg.replace(broadcastRegex, '')
      draftService.broadcast(msg, draftId, ws)
    } else if (teamChosenRegex.test(msg)) {
      msg = msg.replace(teamChosenRegex, '')
      msg = msg.split(':')
      draftService.pickATeam(msg[0], msg[2], msg[1])
    } else {
      ws.send('you sent this: ' + msg)
    }
  })

  ws.on('close', () => {
    draftService.close(draftId, ws)
  })

  ws.on('request', (request) => {
    logger.info('new request!', request)
  })

  ws.on('error', (error) => { 
    logger.error('Error: ' + error)
  })
  
}

module.exports = draftRouter