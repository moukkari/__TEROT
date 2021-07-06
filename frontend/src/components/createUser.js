import axios from 'axios'
import React, { useState } from 'react'

export default function CreateUser({ createMessage }) {
  const [toggle, setToggle] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' })

  const createUser = () => {
    if (window.confirm(`Haluatko luoda käyttäjän ${newUser.username}?`)) {
      const obj = {
        name: newUser.name,
        username: newUser.username,
        password: newUser.password
      }

      axios.post('http://localhost:3001/api/users', obj)
        .then(res => {
          console.log(res)
          createMessage('Käyttäjä luotiin onnistuneesti')
          setNewUser({ name: '', username: '', password: '' })
        })
        .catch(e => {
          console.log(e)
          createMessage('Virhe käyttäjää luodessa', true)
        })
    }
  }

  return (
    <div>
      {toggle ? 
      <div style={{ fontSize: 'xx-small' }}>
        <button style={{float:'right'}} onClick={() => setToggle(!toggle)}>Peruuta</button>
        <h5>Luo uusi käyttäjä</h5>
        
        Käyttäjänimi: <br/>
        <input value={newUser.username} onChange={({ target }) => setNewUser({ ...newUser, username: target.value })} />
        <br/>
        Nimi: <br/>
        <input value={newUser.name} onChange={({ target }) => setNewUser({ ...newUser, name: target.value })} />
        <br/>
        Salasana: <br/>
        <input value={newUser.password} onChange={({ target }) => setNewUser({ ...newUser, password: target.value })} type="password" />
        <br/>
        <button onClick={createUser}>Luo käyttäjä</button>
      </div>
      :
      <button onClick={() => setToggle(!toggle)}>Luo käyttäjä</button>
      }
    </div>
  )
}