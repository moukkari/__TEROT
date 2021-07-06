import React, { useEffect, useState } from 'react'

export default function GameGroupStatus({ user }) {
  const [gameGroups, setGameGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState({})
  const [selectedOption, setSelectedOption] = useState('testi')

  useEffect(() => {
    if (user && user.gameGroups) {
      setSelectedGroup(user.gameGroups[0])
      setGameGroups(user.gameGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>))
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
      {user && user.gameGroups ?
      <div>
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
                <>
                <li>{key}</li>
                <ul>
                  {Object.entries(value).map(([k, v]) => <li key={k}>{k}: {v}</li>)}
                </ul>
                </>
              )
            }
            
          })
          : '' }
        </ul>
        
      </div>
      :
      'Et ole kimpan jäsen'
      }
    </div>
  )
}