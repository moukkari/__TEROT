import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function InviteUser({ user, gameGroupData }) {
  const [users, setUsers] = useState([{}])

  useEffect(() => {
    axios.get('http://localhost:3001/api/users')
      .then(response => {
        // removes the logged in user from the users list
        let filteredUsers = response.data.filter(u => u.username !== user.username)
        setUsers(filteredUsers)
      })
  }, [user.username])

  const invite = otherUser => {
    let request = { ...otherUser, invite: user.adminOf }
    axios.post('http://localhost:3001/api/users/invite', request)
      .then(response => {
        console.log(response)
        if (response.status === 200) {
          let userToUpdate = users.find(u => otherUser.id === u.id)
          userToUpdate.invitations.push(user.adminOf)
          setUsers([ ...users ])
        }
      })
  }

  const usersList = users.map((otherUser, i) => {
    let option = ''
    if (otherUser.invitations && otherUser.invitations.includes(user.adminOf)) {
      option = ' - Kutsuttu'
    } else if (gameGroupData.players && gameGroupData.players.includes(otherUser.id)) {
      option = ' - Liittynyt'
    } else {
      option = <button onClick={() => invite(otherUser)}>invite</button>
    }
    return (
      <li key={i}>
        {otherUser.username} 
        {option}
      </li>
    )
  })

  return (
    <div>
      <h3>Kutsu käyttäjiä kimppaan</h3>
      <ul>
        {usersList}
      </ul>
      
    </div>
  )
}