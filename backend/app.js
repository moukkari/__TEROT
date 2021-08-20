const config = require('./utils/config')
const express = require('express')
const mongoose = require('mongoose')
require('express-async-errors')
const app = express()
const cors = require('cors')
// eslint-disable-next-line no-unused-vars
const expressWs = require('express-ws')(app)

const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const nhlRouter = require('./controllers/nhlroute')
const nhlService = require('./services/nhl')
const draftService = require('./services/draft-service')
const gameGroupRouter = require('./controllers/gamegroup')
const draftRouter = require('./controllers/draft')
const logger = require('./utils/logger')

logger.error('testing')

const mongoOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useFindAndModify: false, 
  useCreateIndex: true 
}

mongoose.connect(config.MONGODB_URI, mongoOptions)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

//nhlService.initialize()
draftService.initialize()

// app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/nhl', nhlRouter)
app.use('/api/gamegroup', gameGroupRouter)

app.ws('/draft/:draftId/:clientId', draftRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app