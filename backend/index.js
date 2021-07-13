const app = require('./app') // varsinainen Express-sovellus
const http = require('http')
const config = require('./utils/config')
const expressWs = require('express-ws')

const server = http.createServer(app)

expressWs(app, server)

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})