const gameGroupRouter = require('express').Router()
const GameGroup = require('../models/gameGroup')
const User = require('../models/user')
const Draft = require('../models/draft')
const Team = require('../models/nhl/team')
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')


const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

gameGroupRouter.post('/create', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findOne({ _id: decodedToken.id }) 

  // if a user is not found or the user already has made a gamegroup
  if (!user || await GameGroup.findOne({ admin: user })) {
    response.json({ error: 'Olet jo kimpan ylläpitäjä' })
    return
  }
  
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
  logger.info('draft created')

  gameGroup.draft = newDraft
  
  const savedGameGroup = await gameGroup.save()
  logger.info('group created')
  user.adminOf = savedGameGroup._id
  user.gameGroups.push(savedGameGroup)

  const savedUser = await user.save()
  logger.info('user saved')

  response.json(savedUser)
  logger.info('creating group went ok')
})

gameGroupRouter.delete('/:id', async (request, response) => {
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const id = request.params.id
  const gameGroup = await GameGroup.findOne({ admin: decodedToken.id })
  logger.info('deleting group: ' + id)


  if (gameGroup) {
    const admin = await User.findOne({ adminOf: gameGroup })
    admin.adminOf = undefined
    await admin.save()
    await gameGroup.remove()

    let players = await User.find({ gameGroups: gameGroup._id })

    players.forEach(async player => {
      player.gameGroups.pull(gameGroup._id)
      await player.save()
      logger.info('removed gamegroup from', player)
    })

    players = await User.find({ invitations: gameGroup._id })

    players.forEach(async player => {
      player.invitations.pull(gameGroup._id)
      await player.save()
      logger.info('removed invitation for', player)
    })

    const draft = await Draft.findOne({ gameGroup: gameGroup._id })
    draft.remove()

    response.status(204).send()
  } else {
    response.status(400).json({ error: 'wrong user' })
  }
})

gameGroupRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const gameGroup = await GameGroup.findOne({ _id: id })
    .populate('players', { name: 1 })

  if (!gameGroup) {
    response.json('eipä löytynyt: ' + id)
  } else {
    response.json(gameGroup)
  }
})

gameGroupRouter.put('/accept/:id', async (request, response) => {
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const id = request.params.id

  logger.info(id, request.body)

  const gameGroup = await GameGroup.findOne({ _id: id })
  const user = await User.findOne({ _id: decodedToken.id })

  if (gameGroup && user ) {
    gameGroup.players.push(user)
    await gameGroup.save()

    user.gameGroups.push(gameGroup._id)
    user.invitations.pull(gameGroup._id)
    const savedUser = await user.save().then(user => user.populate('gameGroups').execPopulate())
    logger.info(savedUser)
    response.status(200).json(savedUser)
  } else {
    response.status(400).json({ error: 'user or gamegroup not found' })
  }
})


gameGroupRouter.get('/draft/:id', async (request, response) => {
  const id = request.params.id
  const draft = await Draft.findOne({ _id: id })
    .populate('draftOrder', { name: 1, username: 1 })
    .populate('teamsLeft', { City: 1, Name: 1, Key: 1 })
    .populate({
      path: 'teamsChosen', 
      populate: { 
        path: 'team',
        select: { City: 1, Name: 1, Key: 1 }
      }
    })
    .populate({
      path: 'teamsChosen', 
      populate: { 
        path: 'user',
        select: { name: 1 }
      }
    })

  if (!draft) {
    response.json('eipä löytynyt: ' + id)
  } else {
    response.json(draft)
  }
})

gameGroupRouter.put('/draft/:id', async (request, response) => {
  try {
    const id = request.params.id
    const body = request.body
    logger.info(id, body)

    const draft = await Draft.findOne({ _id: id })

    if (draft && body) {
      draft.startingTime = body.startingTime
      draft.timeForTakingPick = body.timeForTakingPick

      const savedDraft = await draft.save()

      response.json(savedDraft)
    } else {
      response.json('draft not found')
    }
  } catch {
    response.json('erroria pirusti')
  }
  
})

gameGroupRouter.put('/draft/:id/prePicks', async (request, response) => {
  try {
    const id = request.params.id
    const body = request.body.body
    // logger.info(id, body)

    const draft = await Draft.findOne({ _id: id })

    if (draft) {
      draft.prePicks = await draft.prePicks.filter(p => {
        logger.info(p.user, body.userId, p.user.toString() === body.userId)
        return p.user.toString() !== body.userId
      })

      await draft.prePicks.push({ user: body.userId, picks: body.picks })

      logger.info(`added prepicks for ${body.userId}`)

      await draft.save()
      response.send('ok')
    } else {
      response.send('draft not found')
    }
  } catch {
    logger.info('error')
  }
})

module.exports = gameGroupRouter