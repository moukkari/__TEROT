const nhlRouter = require('express').Router()
const Team = require('../models/nhl/team')

nhlRouter.get('/', async (request, response) => {
  const standings = await Team.find({})
  response.status(200).send(standings)
})

module.exports = nhlRouter