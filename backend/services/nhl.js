const axios = require('axios')
const TeamData = require('../models/nhl/teamData')
const TeamStanding = require('../models/nhl/teamStanding')
let shouldUpdateTeamData = true


const updateData = async () => {
  if (shouldUpdateTeamData) {
    shouldUpdateTeamData = false

    setTimeout(() => {
      shouldUpdateTeamData = true
    }, (4 * 60 * 60 * 1000)) // hour * minute * second * millisecond

    updateTeamData()
  }

  setTimeout(() => {
    updateData()
  }, (5 * 60 * 1000)) // minute * second * millisecond
  
  updateStandings()
}

const updateTeamData = async () => {
  try {
    console.log(`${new Date().toLocaleTimeString()} - updating team data`)
    const teams = await getTeams()

    for (let team of teams) {
      let teamData = await TeamData.findOneAndUpdate({ TeamID: team.TeamID }, team)

      if (teamData === null) {
        console.log('inserting team data for', team.City, team.Name)
        const newTeamData = new TeamData(team)
        await newTeamData.save()
      }
    }
  } catch (e) {
    console.log('error', e)
  }
}

const updateStandings = async () => {
  try {
    console.log(`${new Date().toLocaleTimeString()} - updating standings`)
    const currentSeason = await getCurrentSeason() - 1 // REMOVE THIS -1

    const standings = await getStandings(currentSeason)

    for (let team of standings) {
      let dbStanding = await TeamStanding.findOneAndUpdate({ Name: team.Name }, team)

      // if team is not found in Database, a new team is created
      if (dbStanding === null) {
        console.log('creating new team', team.City, team.Name)
        const newTeamStanding = new TeamStanding(team)
        await newTeamStanding.save()
      }
    }
  } catch (e) {
    console.log('error', e)
  }
}

// Recommended call interval: 5 mins
const getStandings = async (currentSeason) => {
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

const nhl = { updateData, getTeams }

module.exports = nhl