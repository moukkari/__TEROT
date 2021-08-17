const axios = require('axios')
const Team = require('../models/nhl/team')

let shouldUpdateTeamData = true
let teams = []

const initialize = async () => {
  if (shouldUpdateTeamData) {
    shouldUpdateTeamData = false

    setTimeout(() => {
      shouldUpdateTeamData = true
    }, (4 * 60 * 60 * 1000)) // hour * minute * second * millisecond

    teams = await getTeams()
  }

  setTimeout(() => {
    initialize()
  }, (5 * 60 * 1000)) // minute * second * millisecond
  
  updateTeamData()
}

const updateTeamData = async () => {
  try {
    let standings = await getStandings()

    teams.forEach(async (team) => {
      const standing = standings.find(standing => standing.TeamID === team.TeamID)
      if (standing) {
        team = { ...team, ...standing }

        let teamData = await Team.findOneAndUpdate({ TeamID: team.TeamID }, team)

        if (teamData === null) {
          console.log('inserting team data for', team.City, team.Name)
          const newTeamData = new Team(team)
          await newTeamData.save()
        }
      } else {
        console.log(`standings not found for ${team.Name}`)
      }
    })
  } catch (e) {
    console.log('error', e)
  }
}


// Recommended call interval: 5 mins
const getStandings = async () => {
  const currentSeason = await getCurrentSeason() - 1 // REMOVE THIS -1
  const url = `https://fly.sportsdata.io/v3/nhl/scores/json/Standings/${currentSeason}?key=${process.env.NHLAPIKEY}`

  return await axios.get(url)
    .then(response => {
      return response.data
    })
    .catch(e => {
      return e
    })
}

// Recommended call interval: 4 hours
const getTeams = async () => {
  const url = `https://fly.sportsdata.io/v3/nhl/scores/json/teams?key=${process.env.NHLAPIKEY}`

  return await axios.get(url)
    .then(response => {
      return response.data
    })
    .catch(e => {
      return e
    })
}

// Recommended call interval: 5 mins
const getCurrentSeason = async () => {
  const url = `https://fly.sportsdata.io/v3/nhl/scores/json/CurrentSeason?key=${process.env.NHLAPIKEY}`

  return await axios.get(url)
    .then(response => {
      return response.data.Season
    })
    .catch(e => {
      return e
    })
}

const nhl = { initialize }

module.exports = nhl