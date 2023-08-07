import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import "source-map-support/register";
import { extractTokenFromAuthHeader } from "../../auth/utils";

import { createLogger } from "../../utils/logger";
import { authorizeUser } from "../../businessLayer/authorization";
import createHttpError from "http-errors";

const logger = createLogger("auth");

/**
 * Handler function for a custom authorizer in AWS Lambda.
 * Authorizes a user based on an incoming event and generates a policy document to control access to API Gateway endpoints.
 *
 * @param {CustomAuthorizerEvent} event - The event triggered by the custom authorizer.
 * @returns {Promise<CustomAuthorizerResult>} A promise that resolves to a CustomAuthorizerResult representing the authorization result.
 */
export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info("Authorizing a user");
  try {
    const { authorizationToken = "" } = event;
    if (!authorizationToken) {
      throw new createHttpError.BadRequest("Missing auth token");
    }
    const token = extractTokenFromAuthHeader(authorizationToken);
    const authorizedUser = await authorizeUser(token);
    logger.info(authorizedUser);
    logger.info("User was authorized");

    return {
      principalId: authorizedUser.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e: unknown) {
    logger.error("User not authorized", { e });

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};
