import React from 'react'
import { Table } from 'react-bootstrap'

export default function LiveDraftOrder({ liveDraft, teamData, children }) {
  const getStyle = (team) => {
    return {
      backgroundColor: `#${team.PrimaryColor}`,
      color: `#${team.SecondaryColor}`
    }
  }

  return (
    <div>
      <h3>Draft-järjestys</h3>
      <h5>Kierros {liveDraft.round}</h5>
      <h5>Vuoro {liveDraft.totalPick}/ {liveDraft.fullDraftOrder.length}</h5>
      {children}
      <Table>
        <thead>
          <tr>
            <th>Kierros</th>
            <th>Pelaaja</th>
            <th>Joukkue</th>
          </tr>
        </thead>
        <tbody>
          {liveDraft.fullDraftOrder.map((user, i) => {
            let team, rowStyle
            if (liveDraft.teamsChosen[i]) {
              team = teamData.find(t => (
                t.Key === liveDraft.teamsChosen[i].team.Key
              ))
              if (team) rowStyle = getStyle(team)
            }
            return (
              <tr key={i} style={rowStyle}>
                <td style={rowStyle}>{i+1}</td>
                <td>{user.username}</td>
                {team ?
                  <>
                    <td>
                      <img
                        alt={team.Key}
                        src={team.WikipediaLogoUrl}
                        height='20px'
                      />
                    </td>
                    <td>{team.City} {team.Name}</td>
                  </>
                  :
                  <td colSpan='2'></td>
                }
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )
}