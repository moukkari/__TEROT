const axios = require('axios')
const Team = require('../models/nhl/team')

let updateFlorida = {
  Season: 2021,
  SeasonType: 1,
  TeamID: 8,
  Key: 'FLA',
  City: 'Florida',
  Name: 'Panthers',
  Conference: 'Eastern',
  Division: 'Central',
  Wins: 55,
  Losses: 14,
  OvertimeLosses: 5,
  Percentage: 0.661,
  ConferenceWins: 20,
  ConferenceLosses: 12,
  DivisionWins: 37,
  DivisionLosses: 19,
  ShutoutWins: 3,
  ConferenceRank: null,
  DivisionRank: 3,
  GlobalTeamID: 30000008
}

const updateData = async () => {
  console.log('updating standings')

  setTimeout(() => {
    console.log('setTimeOut calling and updating standings')
    updateData()
  }, (5 * 60 * 1000)) // minute * second * millisecond, recommended call interval 5mins
  
  try {
    const standings = await getStandings()
    // console.log('test', standings[0])

    for (let team of standings) {
      let dbTeam = await Team.findOneAndUpdate({ Name: team.Name }, team)

      // if team is not found in Database, a new team is created
      if (dbTeam === null) {
        console.log('creating new team', team.City, team.Name)
        let newTeam = new Team(team)
        await newTeam.save()
      }
    }
  } catch(e) {
    console.log('error', e)
  }
  
}

const getStandings = async () => {
  const url = `https://fly.sportsdata.io/v3/nhl/scores/json/Standings/2021?key=${process.env.NHLAPIKEY}`

  return await axios.get(url)
    .then(response => {
      return response.data
    })
    .catch(e => {
      return e
    })
}

const nhl = { updateData }

module.exports = nhl