import axios from 'axios'
import React, { useEffect, useState } from 'react'
import InviteUser from './inviteUser'
import CreateGameGroup from './createGameGroup'


export default function GameGroupConfig({ user, setUser, createMessage }) {
  const [gameGroupData, setGameGroupData] = useState(null)

  useEffect(() => {
    if (user.adminOf) {
      axios.get(`http://localhost:3001/api/gamegroup/${user.adminOf}`)
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
    if (window.confirm('Haluatko todella poistaa kimpan?')) {
      axios.delete(`http://localhost:3001/api/gamegroup/${gameGroupData._id}`)
      setGameGroupData(null)
    }
  }

  return (
    <div>
      {gameGroupData ?
        <div>
          <button onClick={() => removeGameGroup()}>Poista kimppa</button>
          
          <InviteUser user={user} gameGroupData={gameGroupData} />
          {
            JSON.stringify(gameGroupData, null, 2)
          }
        </div>
        :
        <CreateGameGroup user={user} createMessage={createMessage} setUser={setUser} /> 
      }
    </div>
  )
}