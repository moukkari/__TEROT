const gameGroupRouter = require('express').Router()
const GameGroup = require('../models/gameGroup')
const User = require('../models/user')
const Draft = require('../models/draft')
const Team = require('../models/nhl/team')

gameGroupRouter.post('/create', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username }) 

  // if a user is not found or the user already has made a gamegroup
  if (!user || await GameGroup.findOne({ admin: user })) {
    response.json({ error: 'Olet jo kimpan ylläpitäjä' })
    return
  }
  
  try {
    const teams = await Team.find({})

    const gameGroup = new GameGroup({
      name: body.name,
      admin: user._id,
      players: [user._id]
    })
    
    const newDraft = new Draft({
      gameGroup: gameGroup,
      teamsLeft: teams
    })

    await newDraft.save()
    console.log('draft created')

    gameGroup.draft = newDraft
    
    const savedGameGroup = await gameGroup.save()
    console.log('group created')
    user.adminOf = savedGameGroup._id
    user.gameGroups.push(savedGameGroup)

    const savedUser = await user.save()
    console.log('user saved')

    response.json(savedUser)
    console.log('ok')
  } catch(e) {
    console.log('err')
    response.json({ error: 'Olet jo kimpan ylläpitäjä' })
  }
  
})

gameGroupRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  console.log('deleting: ' + id)
  const gameGroup = await GameGroup.findOne({ _id: id })

  if (!gameGroup) {
    response.json('eipä löytynyt')
  } else {
    const admin = await User.findOne({ adminOf: gameGroup })
    admin.adminOf = undefined
    await admin.save()
    await gameGroup.remove()

    const players = await User.find({ gameGroups: gameGroup._id })

    players.forEach(async player => {
      player.gameGroups.pull(gameGroup._id)
      await player.save()
      console.log('removed', player)
    })

    const draft = await Draft.findOne({ gameGroup: gameGroup._id })
    draft.remove()

    response.json(`${id} poistettu`).end()
  }
})

gameGroupRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const gameGroup = await GameGroup.findOne({ _id: id })
    .populate('draft')

  if (!gameGroup) {
    response.json('eipä löytynyt: ' + id)
  } else {
    response.json(gameGroup)
  }
})

gameGroupRouter.put('/accept/:id', async (request, response) => {
  const id = request.params.id

  console.log(id, request.body)

  try {
    const gameGroup = await GameGroup.findOne({ _id: id })
    const user = await User.findOne({ username: request.body.user })

    if (!gameGroup || !user ) {
      response.json('error accepting invitation')
    } else {
      gameGroup.players.push(user)
      await gameGroup.save()

      user.gameGroups.push(gameGroup._id)
      user.invitations.pull(gameGroup._id)
      const savedUser = await user.save()
      console.log(savedUser)
      response.status(200).json( { msg: 'invitation accepted succesfully', data: { savedUser } } )
    }
  } catch(e) {
    response.status(400).json('error accepting')
  }
})


gameGroupRouter.put('/draft/:id', async (request, response) => {
  try {
    const id = request.params.id
    const body = request.body
    console.log(id, body)

    const draft = await Draft.findOne({ _id: id })

    if (draft && body.date) {
      draft.startingTime = body.date

      const savedDraft = await draft.save()

      response.json(savedDraft)
    } else {
      response.json('draft not found')
    }
  } catch {
    response.json('erroria pirusti')
  }
  
})

module.exports = gameGroupRouter