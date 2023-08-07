import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { extractUserIdFromAuthHeader } from "../../auth/utils";
import { getAllTodos } from "../../businessLayer/todos";
import { createLogger } from "../../utils/logger";
import * as createError from "http-errors";

const logger = createLogger("getTodos");

/**
 * Handler function for retrieving all todos for a user.
 * Retrieves the todos associated with the user specified in the Authorization header of the incoming event.
 *
 * @param {APIGatewayProxyEvent} event - The incoming event triggered by API Gateway.
 * @returns {Promise<APIGatewayProxyResult>} A promise that resolves to an APIGatewayProxyResult representing the response.
 */
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Auth header parsing
    logger.info("GetTodos");
    try {
      const lastKey = event.queryStringParameters?.lastKey ?? null;
      const limit = (event.queryStringParameters?.limit ?? -1) as number;

      const userId = extractUserIdFromAuthHeader(event.headers.Authorization);

      const result = await getAllTodos(userId, lastKey, limit);

      return {
        statusCode: 200,
        body: JSON.stringify({
          items: result.items,
          lastKey: result.lastKey,
          totalItems: result.totalItems,
          itemsLimit: result.itemsLimit,
        }),
      };
    } catch (error) {
      logger.error("Error in handler", { error });
      throw new createError.InternalServerError();
    }
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
