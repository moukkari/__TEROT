const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')

usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username.toLowerCase(),
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
  } catch(e) {
    logger.error(e)
    response.status(400).send(e)
  }
  
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  response.json(users)
})

usersRouter.post('/invite', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ _id: body._id })
  
  if (user) {
    user.invitations.push(body.invite)
    await user.save()
    response.json('ok')
  } else {
    response.status(400).json('user not found')
  }

})

usersRouter.get('/invitations/:id', async (request, response) => {
  const id = request.params.id
  const user = await User.find({ _id: id })
    .populate('invitations')
    
  if (user.invitations) {
    response.status(200).json(user.invitations)
  } else {
    response.status(404).send()
  }
})

module.exports = usersRouter