import React, { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket"
import axios from 'axios'
import TeamChooser from './teamChooser/teamChooser'
import Countdown from './countDown';

export default function LiveDraft({ user, draft, teamData }) {
  const [client, setClient] = useState(null)
  const [liveDraft, setLiveDraft] = useState()
  

  console.log('render')

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
    console.log(user._id, user)
    setClient(new W3CWebSocket(`ws://localhost:3001/draft/${draft._id}/${user._id}`))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft._id, user._id])
  
  useEffect(() => {
    if (client) {
      client.onopen = () => {
        console.log('WebSocket Client Connected')
        client.send('Client sending instant MOI!x')
      }
      client.onmessage = (message) => {
        
        if (message.data.startsWith('change:')) {
          let newDraft = JSON
            .parse(message.data.replace('change:', ''))
          console.log(newDraft)

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

    if (liveDraft.draftOrder[0].username === user.username && 
          window.confirm(`Haluatko todella valita joukkueen ${team.City} ${team.Name}?`)) {
      client.send(`teamChosen:${team._id}`)
    } else {
      console.log(user)
    }
  }

  return (
    <div>
      {liveDraft ? 
      <div>
        

        {liveDraft.status === 'started' ?
        <div>
          <h3>Draft-järjestys</h3>
          <h5>Kierros {liveDraft.round}</h5>
          <h5>Vuoro {liveDraft.pick}</h5>
          <ol>
            {liveDraft.draftOrder.map((user, i) => <li key={i}>{user.username}</li>)}  
          </ol>
          {liveDraft.draftOrder[0].username === user.username ?
            <p>Sinun vuorosi!</p>
            :
            <p>Vuorossa {liveDraft.draftOrder[0].name}</p>
          }
          {/**
            
            <ul>
              {liveDraft.teamsLeft.map((team, i) => {
                return <li key={i} onClick={() => chooseTeam(team)}>{team.Key}</li>
              })}
            </ul>
            */}
            
            <TeamChooser liveDraft={liveDraft} chooseTeam={chooseTeam} teamData={teamData} />
          
        </div>
        : 
        <Countdown liveDraft={liveDraft} />
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
          : ''}
      </div>
      : 'Livedraft ei ole käynnissä'
      }
      
      
    </div>
  )
}