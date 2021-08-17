import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Nav } from 'react-bootstrap'
import GameGroupConfig from './gameGroupConfig'
import GameGroupStatus from './gameGroupStatus'

export default function GameGroupHandler({ user, teamData, setUser, createMessage }) {
    return (
        <Router>
            <Nav className="justify-content-center" activeKey="/">
                <Nav.Item>
                    <Nav.Link href='/'>Kimpat</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href='/admin'>Hallitse omaa kimppaa</Nav.Link>
                </Nav.Item>
            </Nav>

            <Switch>
                <Route exact path='/'>
                    <GameGroupStatus user={user} teamData={teamData} />
                </Route>
                <Route exact path='/admin'>
                    <GameGroupConfig user={user} setUser={setUser} createMessage={createMessage} /> 
                </Route>
            </Switch>
            

        </Router>
    )
}