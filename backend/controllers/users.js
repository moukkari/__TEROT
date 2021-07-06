const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const body = request.body

  console.log(body)

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  response.json(users)
})

usersRouter.post('/invite', async (request, response) => {
  const body = request.body
  console.log(body)

  const user = await User.findOne({ _id: body.id })

  console.log(user.id)
  
  if (user) {
    user.invitations.push(body.invite)
    await user.save()
    response.json('ok')
  } else {
    response.status(400).json('user not found')
  }

  
})

module.exports = usersRouter