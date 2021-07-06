import React, { useEffect, useState } from 'react'
import loginService from '../services/login'

export default function Login({ user, setUser, createMessage }) {
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('') 

  useEffect(() => {
    const user = localStorage.getItem('kiakkoTeroUser')
    console.log('user found', JSON.stringify(user), JSON.parse(user), typeof user)
    if (user) {
      setUser(JSON.parse(user))
    }
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
    <div>
      {!user ?
        <div>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div>
              username
                <input
                type="text"
                value={username}
                name="Username"
                onChange={({ target }) => setUsername(target.value)}
              />
            </div>
            <div>
              password
                <input
                type="password"
                value={password}
                name="Password"
                onChange={({ target }) => setPassword(target.value)}
              />
            </div>
            <button type="submit">login</button>
          </form>
        </div>
        :
        <div>
          <button onClick={() => logOut()}>Log out</button>
          {user.username} logged in <button onClick={() => console.log(user)}>user</button>
        </div>
        }
      </div>
  )
  
}