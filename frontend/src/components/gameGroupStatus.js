import React, { useEffect, useState } from 'react'
import LiveDraft from './liveDraft'
import PreOrder from './preOrder/preOrder'
import axios from 'axios'
import { Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function GameGroupStatus({ user, teamData }) {
  const [gameGroups, setGameGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState({})
  const [selectedOption, setSelectedOption] = useState('testi')

  useEffect(() => {
    console.log('called')
    if (user && user.gameGroups.length > 0) {

      
      setGameGroups(user.gameGroups.map(g => <option key={`g${g._id}`} value={g._id}>{g.name}</option>))

      axios.get(`http://localhost:3001/api/gameGroup/${user.gameGroups[0]._id}`)
        .then(response => {
          if (response) {
            setSelectedGroup(response.data)
          } else {
            console.log('error', response)
          }
        })
        .catch(e => console.log(e))
    }
  }, [user])

  const changeGameGroup = value => {
    console.log(user.gameGroups)
    const group = user.gameGroups.find(g => g._id === value)
    if (group) {
      console.log(group)
      setSelectedOption(value)
      setSelectedGroup(group)
    } else { 
      console.log('group not found')
    }
    
  }

  const GroupStandings = () => {
    let groupStandings = []

    selectedGroup.players.forEach(player => {
      let teams = selectedGroup.draft.teamsChosen
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
                  <img key={t.Key} alt={t.Key} src={t.WikipediaLogoUrl} style={logo} />)
                )}</td>
              </tr>
          )})}
        </tbody>
      </Table>
    )
  }

  const GroupInfo = () => {
    return (
      <div style={{ marginBottom: '3em' }}>
        <table>
          <thead>
            <tr>
              <th>Kimpan {selectedGroup.name} tietoja</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ylläpitäjä</td>
              <td>{selectedGroup.players.find(p => p._id === selectedGroup.admin.name)}</td>
            </tr>
            <tr>
              <td>Draftin tila</td>
              <td>{selectedGroup.draft.status}</td>
            </tr>
            <tr>
              <td>Draftin aika</td>
              <td>{new Date(selectedGroup.draft.startingTime).toLocaleString('fi-FI')}</td>
            </tr>
          </tbody>
          
        </table>
      </div>
    )
  }

  return (
    <div>
      <h2>Kimpat</h2>

      {/** 
      
      {user && user.gameGroups && user.gameGroups.length > 0 && selectedGroup && selectedGroup.draft ? 
          
          : 'no drafts'}
          
      */}
      
      
      {user && user.gameGroups.length > 0 && selectedGroup ?
        <div>
          Valitse kimppa:&nbsp;
          <select value={selectedOption} onChange={({ target }) => changeGameGroup(target.value)}>
            {gameGroups}
          </select>
          <hr/>
          {selectedGroup.players ?
            <GroupInfo />
            : ''
          }
          {selectedGroup.status === 'finished' ?
            <GroupStandings />
            :
            <div>
              {selectedGroup.draft ?
                <div>
                  <LiveDraft user={user} draft={selectedGroup.draft} teamData={teamData} />
                  <PreOrder user={user} draft={selectedGroup.draft} teamData={teamData} />
                </div>
                : ''
              }
              
           </div>
          }
          
        </div>
        :
        <div>
          <p></p>
          <p>Et ole vielä yhdenkään kimpan jäsen.</p>
          <p>Voit <Link to='/admin'>luoda oman kimpan</Link>&nbsp;
            tai pyytää jotain toista kutsumaan sinut kimppaan.</p>
        </div>
      }
    </div>
  )
}