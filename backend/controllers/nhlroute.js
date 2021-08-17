const nhlRouter = require('express').Router()
const Team = require('../models/nhl/team')

nhlRouter.get('/', async (request, response) => {
  const teamData = await Team.find({})

  if (teamData) {
    response.status(200).send(teamData)
  } else {
    response.status(400).send()
  }
})

module.exports = nhlRouter