const nhlRouter = require('express').Router()
const TeamData = require('../models/nhl/teamData')
const TeamStanding = require('../models/nhl/teamStanding')

nhlRouter.get('/standings', async (request, response) => {
  const standings = await TeamStanding.find({})

  if (standings) {
    response.status(200).send(standings)
  } else {
    response.status(400).send()
  }
})

nhlRouter.get('/teamData', async (request, response) => {
  const teamData = await TeamData.find({})
  if (teamData) {
    response.status(200).send(teamData)
  } else {
    response.status(400).send()
  }
})

module.exports = nhlRouter