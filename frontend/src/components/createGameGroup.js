import axios from 'axios'
import React, { useState } from 'react'
import { Button } from 'react-bootstrap'

export default function CreateGameGroup({ user, createMessage, setUser }) {
  const [groupName, setGroupName] = useState('')

  const createGroup = () => {
    if (groupName.length < 5) {
      createMessage('Liian lyhyt nimi', true)
      return
    }

    const request = {
      username: user.username,
      name: groupName
    }

    const config = { headers: { Authorization: `bearer ${user.token}` } }

    axios.post('http://localhost:3001/api/gamegroup/create', request, config)
      .then((res) => {
        console.log(res)
        if (res.data.error) {
          createMessage(res.data.error, true)
        } else {
          createMessage('Kimppa luotu onnistuneesti')
          console.log(res.data)
          setUser({ ...user, ...res.data })
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
      <h4>Luo kimppa</h4>
        Kimpan nimi:
        <input value={groupName} onChange={({ target }) => setGroupName(target.value)} />
        &nbsp;
        <Button onClick={createGroup} variant='success'>Luo kimppa</Button>
    </div>
  )
}