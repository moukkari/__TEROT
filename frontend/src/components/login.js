import React, { useEffect, useState } from 'react'
import loginService from '../services/login'
import { Button, Row, Col } from 'react-bootstrap'
import axios from 'axios'
import { APIURL } from '../services/addresses'


export default function Login({ user, setUser, createMessage }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  console.log('called login')

  useEffect(() => {
    const storageUser = JSON.parse(localStorage.getItem('kiakkoTeroUser'))
    // console.log('user found', JSON.stringify(user), JSON.parse(user), typeof user)
    if (storageUser) {
      const config = { headers: { Authorization: `bearer ${storageUser.token}` } }
      axios.get(`${APIURL}/login`, config)
        .then(() => {
          console.log('valid token')
          setUser(storageUser)
        })
        .catch(e => {
          console.log(e)
          setUser(null)
          localStorage.removeItem('kiakkoTeroUser')
          createMessage('Istunto vanhentunut. Kirjaudutaan ulos...', true)
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser])

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)

    try {
      const u = await loginService.login({ username, password })
      localStorage.setItem('kiakkoTeroUser', JSON.stringify(u))
      setUser(u)
    } catch (exception) {
      console.log('errori', exception)
      createMessage('Väärät tunnukset', true)
      setUser(null)
    }
  }

  const logOut = () => {
    setUser(null)
    localStorage.removeItem('kiakkoTeroUser')
  }

  return (
    <div style={{ marginBottom: '2em' }}>
      {!user ?
        <div>
          <h3>Kirjautuminen</h3>
          <form onSubmit={handleLogin}>
            <div>
              <input
                type="text"
                value={username}
                name="Username"
                placeholder='Käyttäjätunnus'
                onChange={({ target }) => setUsername(target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                name="Password"
                placeholder='Salasana'
                onChange={({ target }) => setPassword(target.value)}
              />
            </div>
            <Button
              type="submit"
              size='sm'
              variant='success'
              style={{ marginTop: '4px' }}
            >Kirjaudu sisään</Button>
          </form>

        </div>
        :
        <Row>
          <Col xs={3} md={4}>
            <p onClick={() => console.log(user)}>{user.username}</p>
          </Col>
          <Col xs={9} md={8}>
            <Button
              onClick={() => logOut()}
              style={{ float: 'right', marginTop: '5px' }}
              variant='secondary'
              size='sm'
            >
              <strong>Kirjaudu ulos</strong>
            </Button>
          </Col>
        </Row>
      }
    </div>
  )

}