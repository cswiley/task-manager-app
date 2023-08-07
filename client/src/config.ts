// const apiId = 'c35vsaqsp4'
// export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

// export const authConfig = {
//   domain: 'dev-4zwoqkhdx6s3mbzq.us.auth0.com', // Auth0 domain
//   clientId: '0Rb8lGMvnma5PSd6RHZt6H87MtWy9L5c', // Auth0 client id
//   callbackUrl: 'http://localhost:8100/callback'

export const apiEndpoint = process.env.REACT_APP_API_ENDPOINT

export const authConfig = {
  domain: process.env.REACT_APP_AUTH_DOMAIN,
  clientId: process.env.REACT_APP_AUTH_CLIENT_ID,
  callbackUrl: process.env.REACT_APP_AUTH_CALLBACK_URL
}
