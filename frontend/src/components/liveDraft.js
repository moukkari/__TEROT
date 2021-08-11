import React, { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket"
import axios from 'axios'

export default function LiveDraft({ username, draft, teamData }) {
  const [client, setClient] = useState(null)
  const [liveDraft, setLiveDraft] = useState()

  useEffect(() => {
    axios.get(`http://localhost:3001/api/gamegroup/draft/${draft._id}`)
        .then(response => {
          setLiveDraft(response.data)
        })
        .catch(e => {
          console.log(e)
        })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

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
        client.send('Client sending instant MOI!x')
      }
      client.onmessage = (message) => {
        console.log(message)
        if (message.data.startsWith('change:')) {
          let newDraft = JSON
            .parse(message.data.replace('change:', ''))

          setLiveDraft(newDraft)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

/*
  const sendMsg = () => {
    client.send(`moi ${username}`)
  }

  const close = () => {
    client.close()
  }

  const broadcast = () => {
    client.send(`broadcast:${username} broadcasting!`)
  }
*/

  const chooseTeam = (team) => {
    console.log(team)

    if (liveDraft.draftOrder[0].username === username && 
          window.confirm(`Haluatko todella valita joukkueen ${team.City} ${team.Name}?`)) {
      client.send(`teamChosen:${team.id}`)
    }
  }

  return (
    <div>
      {liveDraft ? 
      <div>
        <p>{liveDraft.status}</p>
        {liveDraft.status === 'started' ?
        <div>
          <h3>Draft-järjestys</h3>
          <h5>Kierros {liveDraft.round}</h5>
          <h5>Vuoro {liveDraft.pick}</h5>
          <ol>
            {liveDraft.draftOrder.map((user, i) => <li key={i}>{user.name}</li>)}  
          </ol>
          {liveDraft.draftOrder[0].username === username ?
            <p>Sinun vuorosi!</p>
            :
            <p>Vuorossa {liveDraft.draftOrder[0].name}</p>
          }
          <h4>Tiimit jäljellä</h4>
          <ul>
            {liveDraft.teamsLeft.map((team, i) => {
              return <li key={i} onClick={() => chooseTeam(team)}>{team.Key}</li>
            })}
          </ul>

          
        </div>
        : ''
        }
        {liveDraft.status === 'finished' ? 
          <div>
            <h4>Valitut tiimit</h4>
            <ul>
              {liveDraft.teamsChosen.map((element, i) => {
                const data = teamData.find(t => t.Key === element.team.Key)
                return <li key={i}>
                  <img src={data.WikipediaLogoUrl} alt='' width='10px' />
                  {element.team.Key} - {element.user.name}
                  </li>
              })}
            </ul>
          </div>
          : 'no draft'}
      </div>
      : ''
      }
      
      
    </div>
  )
}