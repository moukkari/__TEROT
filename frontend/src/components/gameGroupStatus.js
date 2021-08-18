import React, { useEffect, useState } from 'react'
import LiveDraft from './liveDraft'
import PreOrder from './preOrder/preOrder'
import axios from 'axios'
import { Table } from 'react-bootstrap'
import DraftedTeams from './draftedTeams'

import { Link } from 'react-router-dom'

export default function GameGroupStatus({ user, teamData, createMessage }) {
  const [gameGroups, setGameGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedOption, setSelectedOption] = useState('testi')
  const [draft, setDraft] = useState(null)

  useEffect(() => {
    if (user && user.gameGroups.length > 0) {
      setGameGroups(user.gameGroups.map(g => <option key={`g${g._id}`} value={g._id}>{g.name}</option>))
      getGroupData(user.gameGroups[0]._id)
    }
  }, [user])

  useEffect(() => {
    if (selectedGroup && selectedGroup.draft) {
      axios.get(`http://api.kiakkoterot.fi/api/gamegroup/draft/${selectedGroup.draft._id}`)
        .then(response => {
          setDraft(response.data)
        })
        .catch(e => {
          console.log(e)
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup])

  const changeGameGroup = value => {
    console.log(user.gameGroups)
    const group = user.gameGroups.find(g => g._id === value)
    if (group) {
      console.log(group)
      setSelectedOption(value)
      getGroupData(group._id)
    } else { 
      console.log('group not found')
    }
  }

  const getGroupData = (groupId) => {
    axios.get(`http://api.kiakkoterot.fi/api/gameGroup/${groupId}`)
        .then(response => {
          if (response.data) {
            setSelectedGroup(response.data)
          }
        })
        .catch(e => console.log(e))
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

  const Admin = () => {
    const admin = selectedGroup.players.find(p => p._id === selectedGroup.admin)
    if (admin) return admin.name
    else return 'undefined'
  }
  

  const GroupInfo = () => {
    console.log(selectedGroup)
    return (
      <div style={{ marginBottom: '3em' }}>
        <button onClick={() => console.log(selectedGroup)}>selectedGroup</button>
        <table>
          <thead>
            <tr>
              <th>Kimpan {selectedGroup.name} tietoja</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ylläpitäjä</td>
              <td><Admin /></td>
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
      
      {user && user.gameGroups.length > 0 && draft ?
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

          {draft.status === 'finished' ?
            <GroupStandings />
            :
            <LiveDraft user={user} draft={draft} teamData={teamData} />
          }
          {draft.teamsChosen.length > 0 && draft.status !== 'started' ? 
            <DraftedTeams draft={draft} teamData={teamData} />
            : ''
          }
          {draft.status === 'scheduled' ?
            <PreOrder 
              user={user} 
              draft={selectedGroup.draft} 
              teamData={teamData} 
              createMessage={createMessage}
            />
            : 
            ''
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