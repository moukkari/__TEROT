const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const GameGroup = require('../models/gameGroup')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username }).select('+passwordHash')
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(
    userForToken, 
    process.env.SECRET,
    { expiresIn: 60*60 }
  )

  const responseUser = { token, username: user.username, name: user.name }
  if (user.adminOf) { responseUser.adminOf = user.adminOf }
  if (user.invitations) { 
    const invitations = await GameGroup.find().where('_id').in(user.invitations).populate('admin').exec()
    // console.log(invitations)
    responseUser.invitations = invitations
  }
  if (user.gameGroups) {
    const groups = await GameGroup.find().where('_id').in(user.gameGroups).populate().exec()
    // console.log(groups)
    responseUser.gameGroups = groups
  }

  response
    .status(200)
    .send(responseUser)
})

module.exports = loginRouter