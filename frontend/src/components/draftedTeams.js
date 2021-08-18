import React from 'react'
import { Table } from 'react-bootstrap'


export default function DraftedTeams({ draft, teamData }) {
    return (
      <div>
        <h4>Valitut tiimit</h4>
        <Table striped bordered>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th>Joukkue</th>
              <th>Pelaaja</th>
            </tr>
          </thead>
          <tbody>
          {draft.teamsChosen.map((element, i) => {
            const data = teamData.find(t => t.Key === element.team.Key)
            return (
              <tr key={i}>
                <td xs={2}>
                  {i+1}.
                </td>
                <td xs={2}>
                  <img src={data.WikipediaLogoUrl} alt='' width='20px' />
                </td>
                <td xs={4}>
                  {element.team.City} {element.team.Name}
                </td>
                <td xs={4}>
                  {element.user.name}
                </td>
              </tr>
            )})}
            </tbody>
        </Table>


        {draft.teamsLeft.length > 0 ?
          <div>
            <h4>Valitsematta jääneet tiimit</h4>
            <ul>
              {draft.teamsLeft.map(element => {
                const data = teamData.find(t => t._id === element._id)
                return (<li key={element.Key}>
                  <img src={data.WikipediaLogoUrl} alt='' width='10px' />
                  &nbsp;{element.City} {element.Name}
                </li>
              )})}
            </ul>
          </div>
          : ''
        }
      </div>
    )
}