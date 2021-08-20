import React, { useEffect, useState } from 'react'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import TeamChooser from './teamChooser/teamChooser'
import Countdown from './countDown'
import DraftedTeams from './draftedTeams'
import { WSURL } from '../services/addresses'

export default function LiveDraft({ user, draft, teamData, getGroupData }) {
  const [client, setClient] = useState()
  const [liveDraft, setLiveDraft] = useState(draft)
  let keepAlive = null

  // "OnComponentWillUnMount"
  useEffect(() => {
    return () => {
      clearTimeout(keepAlive)
      if (client) {
        client.close()
      }
    }
  }, [])

  useEffect(() => {
    if (client) {
      client.close()
    }
    setClient(new W3CWebSocket(`${WSURL}/draft/${draft._id}/${user._id}`))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft._id, user._id])


  useEffect(() => {
    if (client) {
      client.onopen = () => {
        console.log('WebSocket Client Connected')
        keepConnectionAlive()
      }
      client.onmessage = (message) => {
        if (message.data.startsWith('change:')) {
          let newDraft = JSON
            .parse(message.data.replace('change:', ''))

          if (newDraft.status === 'finished') {
            getGroupData(newDraft.gameGroup)
          } else {
            setLiveDraft(newDraft)
          }
        } else if (message.data.startsWith('you sent this: keep me alive')) {
          console.log('ping pong')
        } else {
          console.log(message)
        }
      }
      client.onclose = () => {
        client.close()
        clearTimeout(keepAlive)
        setClient(new W3CWebSocket(`${WSURL}/draft/${draft._id}/${user._id}`))
      }
    } else {
      console.log('websocket client not found')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

  /*
  const sendMsg = () => {
    client.send(`moi ${username}`)
  }
*/
  const close = () => {
    client.close()
  }

  const broadcast = () => {
    client.send(`broadcast:${user.name} broadcasting!`)
  }

  const keepConnectionAlive = () => {
    if (liveDraft.status !== 'finished' && client) {
      client.send('keep me alive')
      keepAlive = setTimeout(() => {
        keepConnectionAlive()
      }, 10000)
    } else {
      client.close()
    }
  }

  const chooseTeam = (team) => {
    console.log(team)
    client.send(`teamChosen:${liveDraft._id}:${user._id}:${team._id}`)
  }

  return (
    <div>
      {liveDraft ?

        <div>
          <button onClick={() => broadcast()}>broadcast</button>
          <button onClick={() => close()}>close</button>
          {liveDraft.status === 'started' ?
            <div>
              <h3>Draft-järjestys</h3>
              <h5>Kierros {liveDraft.round}</h5>
              <h5>Vuoro {liveDraft.pick}</h5>
              <ol>
                {liveDraft.fullDraftOrder.map((user, i) => <li key={i}>{user.username}</li>)}
              </ol>
              {liveDraft.draftOrder[0].username === user.username ?
                <div>
                  <p>Sinun vuorosi!</p>
                  <TeamChooser liveDraft={liveDraft} chooseTeam={chooseTeam} teamData={teamData} />
                </div>
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



            </div>
            :
            <Countdown liveDraft={liveDraft} />
          }
          {liveDraft.status === 'finished' ?
            ''
            : <DraftedTeams draft={liveDraft} teamData={teamData} />
          }
        </div>
        : 'Livedraft ei ole käynnissä'
      }


    </div>
  )
}