import React from 'react'
import { Table } from 'react-bootstrap'


export default function GroupStandings({ gameGroup, teamData }) {
  let groupStandings = []

  gameGroup.players.forEach(player => {
    let teams = gameGroup.draft.teamsChosen
      .filter(t => player._id === t.user)
      .map(t => t.team)
      .map(t => teamData.find(data => data._id === t))

    let points = 0
    teams.forEach(t => points += t.Wins)

    groupStandings.push({ user: player.name, teams: teams, points: points })
  })
  groupStandings.sort((a, b) => b.points - a.points)

  const width = 100 / groupStandings[0].teams.length
  const logo = {
    width: `${width}%`
  }

  return (
    <Table striped bordered>
      <thead>
        <tr>
          <th>nimi</th>
          <th>pisteet</th>
          <th>joukkueet</th>
        </tr>
      </thead>
      <tbody>
        {groupStandings.map((standing, i) => {
          return (
            <tr key={i}>
              <td>{standing.user}</td>
              <td>{standing.points}</td>
              <td>{standing.teams.map(t => (
                <img
                  key={t.Key}
                  alt={t.Key}
                  src={t.WikipediaLogoUrl}
                  style={logo}
                />)
              )}</td>
            </tr>
          )})}
      </tbody>
    </Table>
  )
}