import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { withRouter } from 'react-router'

import { Nav } from 'react-bootstrap'
import GameGroupConfig from './gameGroupConfig'
import GameGroupStatus from './gameGroupStatus'

const Navigation = ({ location }) => {
  return (
    <Nav fill justify variant='tabs' activeKey={location.pathname}>
      <Nav.Item>
        <Nav.Link href='/'>Kimpat</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href='/admin'>Hallitse omaa kimppaa</Nav.Link>
      </Nav.Item>
    </Nav>
  )
}

const NavigationWithRouter = withRouter(Navigation)

export default function GameGroupHandler(
  { user, teamData, setUser, createMessage }
) {
  return (
    <Router>
      <NavigationWithRouter />
      <Switch>
        <Route exact path='/'>
          <GameGroupStatus
            user={user}
            teamData={teamData}
            createMessage={createMessage}
          />
        </Route>
        <Route exact path='/admin'>
          <GameGroupConfig
            user={user}
            setUser={setUser}
            createMessage={createMessage}
          />
        </Route>
      </Switch>


    </Router>
  )
}