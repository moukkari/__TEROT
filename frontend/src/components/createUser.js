import axios from 'axios'
import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { APIURL } from '../services/addresses'


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

      axios.post(`${APIURL}/users`, obj)
        .then(res => {
          if (res.status === 201) {
            createMessage(`Käyttäjä ${obj.name} luotiin onnistuneesti`)
            setNewUser({ name: '', username: '', password: '' })
          } else {
            console.log(res)
            createMessage('Virhe käyttäjää luodessa', true)
          }
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
        <div>
          <Button style={{ float:'right' }} onClick={() => setToggle(!toggle)}>Peruuta</Button>
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
          <Button onClick={createUser} variant='success'>Luo käyttäjä</Button>
        </div>
        :
        <Button onClick={() => setToggle(!toggle)} size='lg'>Luo uusi käyttäjä</Button>
      }
    </div>
  )
}