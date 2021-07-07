import axios from 'axios'
import React, { useState } from 'react'

export default function CreateGameGroup({ user, createMessage, setUser }) {
  const [groupName, setGroupName] = useState('')

  const createGroup = () => {
    if (groupName.length < 5) {
      createMessage('Liian lyhyt nimi', true)
      return
    }

    const request = {
      username: user.username,
      token: user.token,
      name: groupName
    }

    axios.post('http://localhost:3001/api/gamegroup/create', request)
      .then((res) => {
        console.log(res)
        if (res.data.error) {
          createMessage(res.data.error, true)
        } else {
          createMessage('Kimppa luotu onnistuneesti')
          console.log(res.data)
          setUser(res.data)
          localStorage.setItem('kiakkoTeroUser', JSON.stringify(res.data))
        }
      })
      .catch(e => { 
        console.log(e) 
        createMessage('Odottamaton virhe', true)
      })
  }

  return (
    <div>
      <h2>Luo kimppa</h2>
        Kimpan nimi:
        <input value={groupName} onChange={({ target }) => setGroupName(target.value)} />
        <button onClick={createGroup}>Create</button>
    </div>
  )
}