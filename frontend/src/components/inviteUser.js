import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'

export default function InviteUser({ user, gameGroupData }) {
  const [users, setUsers] = useState([{}])

  useEffect(() => {
    axios.get('http://api.kiakkoterot.fi/api/users')
      .then(response => {
        // removes the logged in user from the users list
        let filteredUsers = response.data.filter(u => u.username !== user.username)
        setUsers(filteredUsers)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const invite = otherUser => {
    let request = { ...otherUser, invite: user.adminOf }
    axios.post('http://api.kiakkoterot.fi/api/users/invite', request)
      .then(response => {
        console.log(response)
        if (response.status === 200) {
          let userToUpdate = users.find(u => otherUser._id === u._id)
          userToUpdate.invitations.push(user.adminOf)
          setUsers([ ...users ])
        }
      })
  }

  const usersList = users.map((otherUser, i) => {
    let option = ''
    if (otherUser.invitations && otherUser.invitations.includes(user.adminOf)) {
      option = 'Kutsuttu'
    } else if (gameGroupData.players && gameGroupData.players.some(p => p._id === otherUser._id)) {
      option = 'Liittynyt'
    } else {
      option = <Button onClick={() => invite(otherUser)} size='sm' variant='success'>Kutsu</Button>
    }
    return (
      <tr key={i}>
        <td>{otherUser.username} </td>
        <td>{otherUser.name} </td>
        <td>{option}</td>
      </tr>
    )
  })

  return (
    <div>
      <h3>Kutsu käyttäjiä kimppaan</h3>
      <Table>
        <tbody>
          {usersList}
        </tbody>
        
      </Table>
      
    </div>
  )
}