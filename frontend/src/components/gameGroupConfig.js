import axios from 'axios'
import React, { useEffect, useState } from 'react'
import InviteUser from './inviteUser'
import CreateGameGroup from './createGameGroup'
import DraftSettings from './draftSettings'
import { Button } from 'react-bootstrap'

export default function GameGroupConfig({ user, setUser, createMessage }) {
  const [gameGroupData, setGameGroupData] = useState(null)
  console.log('render')

  useEffect(() => {
    if (user.adminOf) {
      axios.get(`http://api.kiakkoterot.fi/api/gamegroup/${user.adminOf}`)
        .then(response => {
          // console.log(res)
          setGameGroupData(response.data)
        })
        .catch(e => {
          console.log(e)
        })
    }
    

  }, [user])

  const removeGameGroup = () => {
    console.log(user.token)
    const config = { headers: { Authorization: `bearer ${user.token}` } }
    if (window.confirm('Haluatko todella poistaa kimpan?')) {
      axios.delete(`http://api.kiakkoterot.fi/api/gamegroup/${gameGroupData._id}`, config)
        .then(response => {
          console.log(response)
          createMessage('Kimppa poistettu onnistuneesti')
          setGameGroupData(null)
        })
        .catch(e => createMessage('Virhe kimppaa poistettaessa', true))
    }
  }

  return (
    <div>

      <h3>Draft-asetukset</h3>
      {gameGroupData && gameGroupData.draft ?
        <div>
          <Button 
            variant='danger' 
            onClick={() => removeGameGroup()}
            style={{ float: 'right' }}
          >
            Poista kimppa
          </Button>

          <DraftSettings draft={gameGroupData.draft} createMessage={createMessage} />
          <InviteUser user={user} gameGroupData={gameGroupData} />
          
        </div>
        :
        <CreateGameGroup user={user} createMessage={createMessage} setUser={setUser} /> 
      }
    </div>
  )
}