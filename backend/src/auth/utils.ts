import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

const BEARER_PREFIX = 'bearer '

/**
 * Extracts the user ID from an authentication header.
 *
 * @param authHeader - The authentication header string.
 * @returns The user ID extracted from the authentication header.
 * @throws {Error} If an error occurs during token extraction or user ID extraction.
 */
export function extractUserIdFromAuthHeader(authHeader: string) {
  const token = extractTokenFromAuthHeader(authHeader)
  return extractUserIdFromToken(token)
}

/**
 * Extracts the user id from a JWT token.
 *
 * @param jwtToken The JWT token string to parse.
 * @returns The user ID extracted from the JWT token, or an empty string if not found.
 */
export function extractUserIdFromToken(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt?.sub ?? ''
}

/**
 * Extracts the token from an authentication header.
 *
 * @param authHeader - The authentication header string.
 * @returns The extracted token.
 * @throws {Error} If the authentication header is missing or invalid.
 */
export function extractTokenFromAuthHeader(authHeader: string): string {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLowerCase().startsWith(BEARER_PREFIX)) {
    throw new Error(`Invalid authentication header: ${authHeader}`)
  }

  return authHeader.slice(BEARER_PREFIX.length)
}
