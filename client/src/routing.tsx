import React from 'react'
import Auth from './auth/Auth'
import { Router, Route, Switch } from 'react-router-dom'
import Callback from './components/Callback'
import { createBrowserHistory } from 'history'
import App from './App'
const history = createBrowserHistory()

const auth = new Auth(history)

const handleAuthentication = (props: any) => {
  const location = props.location
  console.log(location)
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication()
  }
}

export const makeAuthRouting = () => {
  return (
    <Router history={history}>
      <div>
        <Switch>
          <Route
            exact
            path='/callback'
            render={props => {
              handleAuthentication(props)
              return <Callback />
            }}
          />
          <Route
            render={props => {
              return <App auth={auth} {...props} />
            }}
          />
        </Switch>
      </div>
    </Router>
  )
}
