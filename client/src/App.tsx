import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { EditTodo } from './components/EditTodo'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Todos } from './components/Todos'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {
  isAuthenticated: boolean
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleRefresh = this.handleRefresh.bind(this)
  }

  state: AppState = {
    isAuthenticated: false
  }

  handleRefresh() {
    this.props.auth.renewSession()
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  async componentDidMount() {
    const isAuthenticated = await this.props.auth.isAuthenticated()
    this.setState({ isAuthenticated: isAuthenticated })
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign='middle'>
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name='home'>
          <Link to='/'>Home</Link>
        </Menu.Item>

        <Menu.Menu position='right'>{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.state.isAuthenticated) {
      return (
        <Menu.Item name='logout' onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name='login' onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.state.isAuthenticated) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path='/'
          exact
          render={props => {
            return <Todos {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path='/todos/:todoId/edit'
          exact
          render={props => {
            return <EditTodo {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
