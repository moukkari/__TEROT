const config = require('./utils/config')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
// require('express-async-errors')
const cors = require('cors')
const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const nhlRouter = require('./controllers/nhlroute')
const nhlService = require('./services/nhl')
const gameGroupRouter = require('./controllers/gamegroup')

mongoose.connect(config.MONGODB_URI, 
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

nhlService.updateData()

// app.use(express.static('build'))
app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/nhl', nhlRouter)
app.use('/api/gamegroup', gameGroupRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app