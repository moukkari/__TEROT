import axios from 'axios'
import React from 'react'

export default function AcceptInvitation({ user, setUser }) {
  let invitations = ''

  const accept = invitation => {
    console.log(invitation)
    axios.put(`http://localhost:3001/api/gamegroup/accept/${invitation._id}`, { user: user.username })
      .then(response => {
        if (response.status === 200) {
          console.log(response.data)
          const d = response.data
          const newUser = { ...user, invitations: d.invitations, gameGroups: d.gameGroups }
          console.log(newUser)
          setUser(newUser)
          localStorage.setItem('kiakkoTeroUser', JSON.stringify(newUser))
        }
      })
      .catch(e => console.log(e))
  }

  if (user && user.invitations) {
    console.log('invitations', user.invitations)
    invitations = user.invitations.map(i => (
      <li key={i}>
        {i.name} - {i.admin.name}
        <button onClick={() => accept(i)}>Hyväksy</button>
      </li>)
    )
  }

  return (
    <div>
    {user.invitations && user.invitations.length > 0 ? 
    <div>
      <h4>Kimppakutsut</h4>
      <ul>
        {invitations}
      </ul>
    </div>
    :
    <div style={{fontSize: 'small'}}>Ei kutsuja kimppoihin</div>
    }
    </div>
    
  )
}