import React, { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket"

// const client = new W3CWebSocket(`ws://localhost:3001/draft/`)

export default function LiveDraft({ username, draft }) {
  const [client, setClient] = useState(null)
  console.log(draft)

  useEffect(() => {
    setClient(new W3CWebSocket(`ws://localhost:3001/draft/${draft._id}/${username}`))
  }, [draft._id, username])
  
  useEffect(() => {
    if (client) {
      client.onopen = () => {
        console.log('WebSocket Client Connected')
        client.send('Client sending instant MOI')
      }
      client.onmessage = (message) => {
        console.log(message)
      }
    }
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

  return (
    <div>
      Practical Intro To WebSockets
      <br/>
      <button onClick={() => sendMsg()}>Send Msg</button>
      <br/>
      <button onClick={() => close()}>Close</button>
      <br/>
      <button onClick={() => broadcast()}>Broadcast</button>
    </div>
  )
}