#!/usr/bin/env nodejs
const app = require('./app') // varsinainen Express-sovellus
const http = require('http')
const config = require('./utils/config')
const expressWs = require('express-ws')
const logger = require('./utils/logger')
const server = http.createServer(app)

expressWs(app, server)

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})