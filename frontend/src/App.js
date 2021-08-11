import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import Login from './components/login'
import 'bootstrap/dist/css/bootstrap.min.css'
import GameGroupConfig from './components/gameGroupConfig'
import CreateUser from './components/createUser'
import AcceptInvitation from './components/acceptInvitation'
import GameGroupStatus from './components/gameGroupStatus'

const App = () => {
  const [message, setMessage] = useState(null)
  const [user, setUser] = useState(null)
  const [standings, setStandings] = useState([])
  const [teamData, setTeamData] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3001/api/nhl/standings')
      .then(res => {
        const sortedStandings = res.data.sort((a, b) => {
          const aw = a.Wins, ao = a.OvertimeLosses, bw = b.Wins, bo = b.OvertimeLosses
          return ((aw * 2) + ao) < ((bw * 2) + bo) ? 1 : ((bw * 2) + bo) < ((aw * 2) + ao) ? -1 : 0
        })   
          
        setStandings(sortedStandings)
      })
      .catch(e => console.log(e)) 
    
    axios.get('http://localhost:3001/api/nhl/teamData')
      .then(res => {
        setTeamData(res.data)
      })
      .catch(e => console.log(e))
  }, [])
  
  const createMessage = (msg, error = false) => {
    let style = { 
      position: 'absolute', 
      top: 0, 
      right: '50%',
      border: '1px solid black',
      padding: '1em',
      borderRadius: '1em'
    }
    style.color = error ? 'red' : 'green'
    setMessage(<h3 style={style}>{msg}</h3>)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }


  return (
    <div>
      <Row>
        <Col>
          <h1>Terot</h1>
          {message}
          
        </Col>
        <Col>
          <CreateUser createMessage={createMessage} />
        </Col>
        <Col>
            <Login user={user} setUser={setUser} createMessage={createMessage} />
            {user ? <AcceptInvitation user={user} setUser={setUser} /> : '' }
        </Col>
      </Row>
      <Row>
        <Col>
          {user ?
          <GameGroupStatus user={user} teamData={teamData} />
          :''}
        </Col> 
        <Col>
          {user ?
            <GameGroupConfig user={user} setUser={setUser} createMessage={createMessage} /> 
            : 
            ''}
        </Col> 
        <Col>
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              { standings ? standings.map(team => {
                return (
                  <tr key={team.Name}>
                    <td>{team.City} {team.Name}</td>
                    <td>{(team.Wins * 2) + team.OvertimeLosses}</td>
                  </tr>
                )
              }) 
              : ''}
            </tbody>
          </table>
        </Col>
      </Row>
      
    </div>
  )
}

export default App
