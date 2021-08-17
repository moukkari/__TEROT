const config = require('./utils/config')
const express = require('express')
const mongoose = require('mongoose')
require('express-async-errors')
const app = express()
// require('express-async-errors')
const cors = require('cors')
const expressWs = require('express-ws')(app)

const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const nhlRouter = require('./controllers/nhlroute')
const nhlService = require('./services/nhl')
const draftService = require('./services/draft-service')
const gameGroupRouter = require('./controllers/gamegroup')
const draftRouter = require('./controllers/draft')

const mongoOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useFindAndModify: false, 
  useCreateIndex: true 
}

mongoose.connect(config.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

//nhlService.initialize()
draftService.initialize()

// app.use(express.static('build'))
app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/nhl', nhlRouter)
app.use('/api/gamegroup', gameGroupRouter)

app.ws('/draft/:draftId/:clientId', draftRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app