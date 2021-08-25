import React, { useEffect, useState } from 'react'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import TeamChooser from './teamChooser/teamChooser'
import Countdown from './countDown'
import { WSURL } from '../services/addresses'
import LiveDraftOrder from './liveDraftOrder'

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

  const close = () => {
    client.close()
  }

  const broadcast = () => {
    client.send(`broadcast:${user.name} broadcasting!`)
  }
  */

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
    client.send(`teamChosen:${liveDraft._id}:${user._id}:${team._id}`)
  }

  return (
    <div>
      {liveDraft ?
        <div>
          {liveDraft.status === 'started' ?
            <div>
              <LiveDraftOrder liveDraft={liveDraft} teamData={teamData}>
                {liveDraft.draftOrder[0].username === user.username ?
                  <div>
                    <p>Sinun vuorosi!</p>
                    <TeamChooser
                      liveDraft={liveDraft}
                      chooseTeam={chooseTeam}
                      teamData={teamData}
                    />
                  </div>
                  :
                  <p>Vuorossa {liveDraft.draftOrder[0].name}</p>
                }
              </LiveDraftOrder>
            </div>
            :
            <Countdown liveDraft={liveDraft} />
          }
        </div>
        : 'Livedraft ei ole käynnissä'
      }
    </div>
  )
}