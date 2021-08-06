import React, { useEffect, useState } from 'react'
import LiveDraft from './liveDraft'


export default function GameGroupStatus({ user }) {
  const [gameGroups, setGameGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState({})
  const [selectedOption, setSelectedOption] = useState('testi')
  const [toggle, setToggle] = useState(false)

  useEffect(() => {
    console.log('called')
    if (user && user.gameGroups) {
      setSelectedGroup(user.gameGroups[0])
      setGameGroups(user.gameGroups.map(g => <option key={`g${g._id}`} value={g._id}>{g.name}</option>))
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

  return (
    <div>
      <h1>Kimppa</h1>
      {user && user.gameGroups && user.gameGroups.length > 0 && selectedGroup && selectedGroup.draft ? 
          <LiveDraft username={user.username} draft={selectedGroup.draft} />
          : 'no drafts'}
      {toggle && user && user.gameGroups ?
      <div>
        <button onClick={() => setToggle(false)}>Piilota kimppa</button>
        <select value={selectedOption} onChange={({ target }) => changeGameGroup(target.value)}>
          {gameGroups}
        </select>
        <ul>
          {selectedGroup ?
          Object.entries(selectedGroup).map(([key, value], i) => {
            if (typeof(value) !== 'object') {
              return <li key={i}>{key}: {value.toString()}</li>
            } else {
              return (
                <div key={i}>
                <li>{key}</li>
                <ul>
                  {Object.entries(value).map(([k, v]) => <li key={k}>{k}: {v}</li>)}
                </ul>
                </div>
              )
            }
            
          })
          : '' }
        </ul>
        
      </div>
      :
      <button onClick={() => setToggle(true)}>Näytä kimppa</button> 
      }
    </div>
  )
}