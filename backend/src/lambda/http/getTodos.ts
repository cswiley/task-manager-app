import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
// import middy from "middy";
// import { cors, httpErrorHandler } from "middy/middlewares";
import { extractUserIdFromAuthHeader } from "../../auth/utils";
import { getAllTodos } from "../../businessLayer/todos";
import { createLogger } from "../../utils/logger";
import * as createError from "http-errors";
import { GetTodosResponse } from "../../response/GetTodosResponse";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import cors from "@middy/http-cors";

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
    try {
      const limit: number = parseInt(
        event.queryStringParameters?.limit ?? "",
        10
      );

      const userId = extractUserIdFromAuthHeader(event.headers.Authorization);
      if (!userId) {
        throw new createError.Unauthorized("Auth header is invalid");
      }

      const lastKey = event.queryStringParameters?.lastKey;

      const result: GetTodosResponse = await getAllTodos(
        userId,
        lastKey,
        limit
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          items: result.items,
          lastKey: result.lastKey,
          totalItems: result.totalItems,
          itemsLimit: result.itemsLimit,
        }),
      };
    } catch (error: unknown) {
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
