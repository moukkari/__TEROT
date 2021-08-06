import React, { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket"
import axios from 'axios'

export default function LiveDraft({ username, draft }) {
  const [client, setClient] = useState(null)
  const [liveDraft, setLiveDraft] = useState()
  console.log(draft, liveDraft)

  useEffect(() => {
    axios.get(`http://localhost:3001/api/gamegroup/draft/${draft._id}`)
        .then(response => {
          console.log(response.data)
          setLiveDraft(response.data)
        })
        .catch(e => {
          console.log(e)
        })
  }, [draft._id])

  useEffect(() => {
    if (client) {
      client.close()
    }
    setClient(new W3CWebSocket(`ws://localhost:3001/draft/${draft._id}/${username}`))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft._id, username])
  
  useEffect(() => {
    if (client) {
      client.onopen = () => {
        console.log('WebSocket Client Connected')
        client.send('Client sending instant MOI!')
      }
      client.onmessage = (message) => {
        console.log(message)
        if (message.data.startsWith('change:')) {
          let newDraft = JSON.parse(message.data.replace('change:', '')).updateDescription.updatedFields
          console.log(newDraft)
          let theDraft = {...liveDraft, ...newDraft}
          console.log(theDraft)
          setLiveDraft(theDraft)
        }
        
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

  const sendMsg = () => {
    client.send(`moi ${username}`)
  }

  const close = () => {
    client.close()
  }

  const broadcast = () => {
    client.send(`broadcast:${username} broadcasting!`)
  }

  const chooseTeam = (team) => {
    console.log(team)
    client.send(`teamChosen:${team}`)
  }

  return (
    <div>
      Practical Intro To WebSockets
      <br/>
      <button onClick={() => sendMsg()}>Send Msg</button>
      <br/>
      <button onClick={() => close()}>Close</button>
      <br/>
      <button onClick={() => broadcast()}>Broadcast</button>
      {liveDraft ? 
      <div>
        <p>{liveDraft.status}</p>
        <h3>Draft-järjestys</h3>
        <ol>
          {liveDraft.draftOrder.map((user, i) => <li key={i}>{user.name}</li>)}  
        </ol>
        {liveDraft.draftOrder[0].username === username ?
          <p>Sinun vuorosi!</p>
          :
          <p>Vuorossa {liveDraft.draftOrder[0].name}</p>
        }
        <ul>
          {liveDraft.teamsLeft.map((team, i) => <li key={i} onClick={() => chooseTeam(team.Key)}>{team.Key}</li>)}
        </ul>
      </div>
      : 'no draft'
      }
      
    </div>
  )
}