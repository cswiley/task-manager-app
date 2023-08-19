import auth0 from 'auth0-js'
import { authConfig } from '../config'
const tokenExpirationThresholdInSeconds = 1800

export default class Auth {
  accessToken
  idToken
  expiresAt

  auth0 = new auth0.WebAuth({
    domain: authConfig.domain,
    clientID: authConfig.clientId,
    redirectUri: authConfig.callbackUrl,
    responseType: 'token id_token',
    scope: 'openid'
  })

  constructor(history) {
    this.history = history

    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.handleAuthentication = this.handleAuthentication.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.getAccessToken = this.getAccessToken.bind(this)
    this.getIdToken = this.getIdToken.bind(this)
    this.getTokenExpirationTime = this.getTokenExpirationTime.bind(this)
    this.renewSession = this.renewSession.bind(this)
  }

  login() {
    this.auth0.authorize()
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
      } else if (err) {
        this.history.replace('/')
        alert(`Error: ${err.error}. Check the console for further details.`)
      }
    })
  }

  getTokenExpirationTime() {
    return localStorage.getItem('expiresAt') ?? ''
  }

  getAccessToken() {
    return localStorage.getItem('accessToken') ?? ''
  }

  getIdToken() {
    return localStorage.getItem('idToken') ?? ''
  }

  setSession(authResult) {
    // Set isLoggedIn flag in localStorage

    // Set the time that the access token will expire at
    let expiresAt = authResult.idTokenPayload.exp * 1000
    this.accessToken = authResult.accessToken
    this.idToken = authResult.idToken
    this.expiresAt = expiresAt

    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('accessToken', this.accessToken)
    localStorage.setItem('idToken', this.idToken)
    localStorage.setItem('expiresAt', this.expiresAt)

    // navigate to the home route
    this.history.push('/')
  }

  checkSession() {
    return new Promise((resolve, reject) => {
      this.auth0.checkSession({}, (err, authResult) => {
        if (err) {
          reject(err)
        } else {
          resolve(authResult)
        }
      })
    })
  }

  async renewSession() {
    const expiresAt = Math.floor(this.getTokenExpirationTime() * 1000)
    const now = Math.floor(Date.now() * 1000)
    if (!expiresAt) {
      return false
    }
    const remainingTime = expiresAt - now
    if (remainingTime < tokenExpirationThresholdInSeconds) {
      try {
        const authResult = await this.checkSession()
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult)
          return true
        }
        this.logout()
        return false
      } catch (err) {
        this.logout()
        // alert(
        //   `Could not get a new token (${err.error}: ${err.error_description}).`
        // )
        return false
      }
    }
    return true
  }

  logout() {
    // Remove tokens and expiry time
    this.accessToken = null
    this.idToken = null
    this.expiresAt = 0

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('idToken')

    this.auth0.logout({
      returnTo: window.location.origin
    })

    // navigate to the home route
    this.history.replace('/')
  }

  async isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    return this.renewSession()
  }
}
