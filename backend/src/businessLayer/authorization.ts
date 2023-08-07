import { JwtPayload } from '../auth/JwtPayload'
import { verifyToken } from '../dataLayer/tokenValidation'

/**
 * Authorizes a user based on the provided token.
 *
 * @param {string} token - The JWT token to be verified and authorized.
 * @returns {Promise<JwtPayload>} - A Promise that resolves to the authorized user's payload if the token is valid.
 * @throws {Error} - Throws an error if the token is invalid or authorization fails.
 */
export async function authorizeUser(token: string): Promise<JwtPayload> {
  return (await verifyToken(token)) as JwtPayload
}
