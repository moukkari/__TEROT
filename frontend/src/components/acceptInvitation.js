import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { APIURL } from '../services/addresses'


export default function AcceptInvitation({ user, setUser, createMessage }) {
  const [invitations, setInvitations] = useState([])
  const [invitationList, setInvitationList] = useState('')

  const accept = invitation => {
    console.log(invitation)
    const config = { headers: { Authorization: `bearer ${user.token}` } }
    axios.put(`${APIURL}/gamegroup/accept/${invitation._id}`, null, config)
      .then(response => {
        if (response.status === 200) {
          const newInvitations = invitations.filter(i => i._id.toString() !== invitation._id.toString())
          setInvitations(newInvitations)

          const d = response.data
          const newUser = { ...user, invitations: d.invitations, gameGroups: d.gameGroups }
          console.log(newUser)
          setUser(newUser)
          localStorage.setItem('kiakkoTeroUser', JSON.stringify(newUser))
        }
      })
      .catch(e => console.log(e))
  }

  useEffect(() => {
    if (invitations.length > 0) {
      console.log(invitations)
      setInvitationList(invitations.map(i => (
        <li key={i}>
          {i.name} - {i.admin.name}
          <Button onClick={() => accept(i)} size='sm' variant='success'>Hyväksy</Button>
        </li>)
      ))
    }
  }, [invitations])


  const update = () => {
    axios.get(`${APIURL}/users/invitations/${user._id}`)
      .then(response => {
        setInvitations(response.data)
        let msg = 'Kutsut päivitetty'
        if (response.data.length === 0) {
          msg += ', ei uusia kutsuja'
        }
        createMessage(msg)
      })
      .catch(e => {
        console.log(e)
        createMessage('Kutsuja ei löytynyt', true)
      })
  }

  return (
    <div>
      <Button
        size='sm'
        onClick={() => update()}
        variant='secondary'
        style={{ float: 'right' }}
      >
        Päivitä
      </Button>
      <h4>Kimppakutsut</h4>
      {invitations.length > 0 ?
        <ul>
          {invitationList}
        </ul>
        :
        <div style={{ fontSize: 'small' }}>Ei kutsuja kimppoihin</div>
      }
    </div>

  )
}