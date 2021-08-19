const axios = require('axios')
const Team = require('../models/nhl/team')
const Match = require('../models/nhl/match')
const APIURL = 'https://fly.sportsdata.io/v3/nhl/scores/json'
const logger = require('../utils/logger')

let shouldUpdateTeamData = true
let teams = []

const initialize = async () => {
  if (shouldUpdateTeamData) {
    shouldUpdateTeamData = false

    setTimeout(() => {
      shouldUpdateTeamData = true
    }, (4 * 60 * 60 * 1000)) // hour * minute * second * millisecond

    teams = await getTeams()
    updateGamesByDate()
  }

  setTimeout(() => {
    initialize()
  }, (60 * 60 * 1000)) // minute * second * millisecond
  
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
          logger.info('inserting team data for', team.City, team.Name)
          const newTeamData = new Team(team)
          await newTeamData.save()
        }
      } else {
        logger.info(`standings not found for ${team.Name}`)
      }
    })
  } catch (e) {
    logger.info('error', e)
  }
}


// Recommended call interval: 5 mins
const getStandings = async () => {
  const currentSeason = await getCurrentSeason()
  const url = `${APIURL}/Standings/${currentSeason.Season - 1}?key=${process.env.NHLAPIKEY}`

  logger.info(currentSeason, url)
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
  const url = `${APIURL}/teams?key=${process.env.NHLAPIKEY}`

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
  const url = `${APIURL}/CurrentSeason?key=${process.env.NHLAPIKEY}`

  return await axios.get(url)
    .then(response => {
      return response.data
    })
    .catch(e => {
      return e
    })
}

const updateGamesByDate = async () => {
  const currentSeason = await getCurrentSeason()
  let d = new Date()
  let seasonStartingDate = new Date(currentSeason.RegularSeasonStartDate)
  if (d.getTime() < seasonStartingDate.getTime()) {
    d = seasonStartingDate
  }
  logger.info(d.toLocaleString('fi-FI'))

  // eg. 2021-OCT-12
  const dString = `${d.getFullYear()}-${d.toLocaleString('default', {month: 'short'}).toUpperCase()}-${('0' + d.getDate()).slice(-2)}`
  const url = `${APIURL}/GamesByDate/${dString}?key=${process.env.NHLAPIKEY}`

  const data = await axios.get(url)
    .then(response => {
      return response.data
    })
    .catch(e => {
      return e
    })

  if (data.length > 0) {
    data.forEach(async (match) => {
      let matchData = await Match.findOneAndUpdate({ GameID: match.GameID }, match)

      if (matchData === null) {
        logger.info('inserting match data:', match.AwayTeam, 'vs', match.HomeTeam)
        const newMatchData = new Match(match)
        await newMatchData.save()
      }
    })
  }
}

const nhl = { initialize }

module.exports = nhl