import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Login from './components/login'
import 'bootstrap/dist/css/bootstrap.min.css'
import AcceptInvitation from './components/acceptInvitation'
import GameGroupHandler from './components/gameGroupHandler'
import Standings from './components/standings'
import CreateUser from './components/createUser'

const App = () => {
  const [message, setMessage] = useState(null)
  const [user, setUser] = useState(null)
  const [teamData, setTeamData] = useState([])

  useEffect(() => {
    console.log('updating season standings')
    axios.get('http://api.kiakkoterot.fi/api/nhl/')
      .then(res => {
        setTeamData(res.data)
      })
      .catch(e => console.log(e)) 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const createMessage = (msg, error = false) => {
    let style = { 
      position: 'absolute', 
      top: 0,
      borderBottom: '1px solid black',
      padding: '1em',
      width: '100%',
      color: 'white',
      zIndex: 1
    }
    style.backgroundColor = error ? 'rgba(255,0,0,0.9)' : 'rgba(0,128,0,0.9)'
    setMessage(<h3 style={style} onClick={() => setMessage(null)}>{msg}</h3>)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  return (
    <div>
      {message}
      <Container style={{border: '1px solid black'}}> 
        <Row>
          <Col xs={4} md={8}>
            <h1>Terot</h1>
            
            
          </Col>
          <Col xs={8} md={4}>
              <Login user={user} setUser={setUser} createMessage={createMessage} />
              {user ? <AcceptInvitation user={user} setUser={setUser} /> : '' }
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={8} style={{ marginBottom: '3em' }}>
            
            {user ?
              <GameGroupHandler 
                user={user} 
                setUser={setUser} 
                createMessage={createMessage} 
                teamData={teamData}
              />
              : 
              <CreateUser createMessage={createMessage} />
            }
              
          </Col> 
          <Col xs={12} md={4}>
              <Standings teamData={teamData} />
          </Col>
        </Row>
        <Row>
          <Col>
            &copy; <a href='mailto:tyrkkoilmari@gmail.com'>Ilmari Tyrkkö</a> 2021
          </Col>
        </Row>
        
      </Container>
    </div>
  )
}

export default App
