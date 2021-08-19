import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Table } from 'react-bootstrap'
import { APIURL } from '../services/addresses'

export default function Matches({ teamData, draft }) {
  const [matchData, setMatchData] = useState([])

  useEffect(async () => {
    await axios.get(`${APIURL}/nhl/matches`)
      .then(res => setMatchData(res.data))
      .catch(e => console.log(e))
  }, [])

  return (
    <div>
      <h5>Seuraavat pelit</h5>
      <Table>
        <thead>
          <tr>
            <th>Koti</th>
            <th></th>
            <th>Pelaaja</th>
            <th></th>
            <th>Pelaaja</th>
            <th></th>
            <th>Vieras</th>
          </tr>
        </thead>
        <tbody>
          {matchData.map(m => {
            let home = draft.teamsChosen.find(el => el.team.Key === m.HomeTeam)
            let away = draft.teamsChosen.find(el => el.team.Key === m.AwayTeam)
            let hData = teamData.find(t => t.Key === m.HomeTeam)
            let aData = teamData.find(t => t.Key === m.AwayTeam)
            // Seattle will play on opening night, but it's data is still missing
            if (!away && !aData) {
              away = { user: { name: 'not found' }, team: { City: 'Seattle', Name: 'Kraken', Key: 'SEA' } }
              aData = {
                Key: 'SEA',
                WikipediaLogoUrl:
                'https://upload.wikimedia.org/wikipedia/fi/thumb/8/8f/Seattle_Kraken_logo.svg/200px-Seattle_Kraken_logo.svg.png'
              }
            }
            return (
              <tr key={m.GameID}>
                <td>{home.team.City} {home.team.Name}</td>
                <td>
                  <img alt={hData.Key} src={hData.WikipediaLogoUrl} height='20px' />
                </td>
                <td>{home.user.name}</td>
                <td>vs</td>
                <td>{away.user.name}</td>
                <td>
                  <img alt={aData.Key} src={aData.WikipediaLogoUrl} height='20px' />
                </td>
                <td>{away.team.City} {away.team.Name}</td>
              </tr>
            )
          })}
        </tbody>

      </Table>
    </div>
  )
}