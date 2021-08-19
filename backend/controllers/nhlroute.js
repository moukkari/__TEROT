const nhlRouter = require('express').Router()
const Match = require('../models/nhl/match')
const Team = require('../models/nhl/team')

nhlRouter.get('/', async (request, response) => {
  const teamData = await Team.find({})

  if (teamData) {
    response.status(200).send(teamData)
  } else {
    response.status(400).send()
  }
})

nhlRouter.get('/matches', async (request, response) => {
  const matchData = await Match.find({})

  if (matchData) {
    response.status(200).send(matchData)
  } else {
    response.status(400).send()
  }
})

module.exports = nhlRouter