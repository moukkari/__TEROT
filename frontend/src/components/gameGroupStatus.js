import React, { useEffect, useState } from 'react'
import LiveDraft from './liveDraft'
import PrePicks from './prePicks/prePicks'
import axios from 'axios'
import DraftedTeams from './draftedTeams'
import { Link } from 'react-router-dom'
import { APIURL } from '../services/addresses'
import Matches from './matches'
import GroupStandings from './groupStandings'
import GameGroupInfo from './gameGroupInfo'

export default function GameGroupStatus({
  user, teamData, createMessage, matchData
}) {
  const [gameGroups, setGameGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedOption, setSelectedOption] = useState('undefined')
  const [draft, setDraft] = useState(null)

  useEffect(() => {
    console.log('called this', user.gameGroups)
    if (user && user.gameGroups.length > 0) {
      setGameGroups(user.gameGroups.map(g => (
        <option key={`g${g._id}`} value={g._id}>{g.name}</option>
      )))
      getGroupData(user.gameGroups[0]._id)
    }
  }, [user])

  useEffect(() => {
    if (selectedGroup && selectedGroup.draft) {
      axios.get(`${APIURL}/gamegroup/draft/${selectedGroup.draft._id}`)
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
    axios.get(`${APIURL}/gameGroup/${groupId}`)
      .then(response => {
        if (response.data) {
          setSelectedGroup(response.data)
        }
      })
      .catch(e => console.log('error', groupId, e))
  }

  return (
    <div>
      <h2>Kimpat</h2>

      {selectedGroup && draft ?
        <div>
          Valitse kimppa:&nbsp;
          <select value={selectedOption} onChange={({ target }) => (
            changeGameGroup(target.value)
          )}>
            {gameGroups}
          </select>
          <hr/>

          {selectedGroup.players ?
            <GameGroupInfo selectedGroup={selectedGroup} />
            : ''
          }

          {draft.status === 'finished' ?
            <div>
              <GroupStandings gameGroup={selectedGroup} teamData={teamData} />
              <Matches
                teamData={teamData}
                matchData={matchData}
                draft={draft}
              />
              <DraftedTeams draft={draft} teamData={teamData} />
            </div>
            :
            <LiveDraft
              user={user}
              draft={draft}
              teamData={teamData}
              getGroupData={getGroupData}
            />
          }
          {draft.status === 'scheduled' ?
            <PrePicks
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