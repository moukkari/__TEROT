import React from 'react'
import { Table } from 'react-bootstrap'

export default function Standings({ teamData }) {
    const sortedStandings = teamData.sort((a, b) => {
      const aw = a.Wins, ao = a.OvertimeLosses, bw = b.Wins, bo = b.OvertimeLosses
      return ((aw * 2) + ao) < ((bw * 2) + bo) ? 1 : ((bw * 2) + bo) < ((aw * 2) + ao) ? -1 : 0
    }) 

    return (
      <Table striped bordered>
        <thead>
          <tr> 
            <th></th>
            <th>Joukkue</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {sortedStandings.map(team => {
            return (
              <tr key={team.Name} onClick={() => console.log(team)}>
                <td width='15%' ><img alt={team.Key} src={team.WikipediaLogoUrl} width='100%' /></td>
                <td>{team.City} {team.Name}</td>
                <td>{(team.Wins * 2) + team.OvertimeLosses}</td>
              </tr>
            )})
          }
        </tbody>
      </Table>
    )
  }