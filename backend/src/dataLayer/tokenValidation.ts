import { JwtPayload } from '../auth/JwtPayload'
import { verify, decode } from 'jsonwebtoken'
const jwksClient = require('jwks-rsa')
const jwksUri =
  'https://dev-4zwoqkhdx6s3mbzq.us.auth0.com/.well-known/jwks.json'
const client = jwksClient({
  jwksUri
})
import { Jwt } from '../auth/Jwt'

export async function verifyToken(token: string): Promise<JwtPayload> {
  const decoded = decode(token, { complete: true }) as Jwt
  const key = await client.getSigningKey(decoded.header.kid)
  const signingKey = key.getPublicKey()

  return new Promise((resolve, reject) => {
    verify(token, signingKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded as JwtPayload)
      }
    })
  })
}
