import { APIGatewayProxyEvent } from "aws-lambda";
import { extractUserIdFromToken } from "../auth/utils";
import EvaluatedLastKey from "../dataLayer/EvaluatedLastKey";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization;
  const split = authorization.split(" ");
  const jwtToken = split[1];

  return extractUserIdFromToken(jwtToken);
}

export function decodeLastEvaluatedKey(
  lastEvaluatedKey: string | undefined
): EvaluatedLastKey | undefined {
  if (lastEvaluatedKey === undefined || lastEvaluatedKey.trim().length === 0) {
    return undefined;
  }
  if (!isValidBase64(lastEvaluatedKey)) {
    throw new Error("Invalid last key value");
  }
  const decodedLastKey: string = Buffer.from(
    lastEvaluatedKey,
    "base64"
  ).toString("utf-8");
  try {
    return JSON.parse(decodedLastKey) as EvaluatedLastKey;
  } catch (error) {
    throw new Error("Invalid last key value");
  }
}

function isValidBase64(value: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]+(?:=|==)?$/;

  return base64Regex.test(value);
}
