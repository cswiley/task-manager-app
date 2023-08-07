import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";
import { createTodo } from "../../businessLayer/todos";
import { extractUserIdFromAuthHeader } from "../../auth/utils";
import createHttpError from "http-errors";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import cors from "@middy/http-cors";
import { createLogger } from "../../utils/logger";
const logger = createLogger("createTodo");

import jsonBodyParser from "@middy/http-json-body-parser";

/**
 * Handles the Lambda function for creating a new todo item.
 *
 * @param event - The API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 * @throws {Error} If an error occurs during request parsing, authentication header parsing, or todo creation.
 */
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("creating todo");
    if (event.body === null || typeof event.body === "string") {
      throw new createHttpError.BadRequest("Invalid request body");
    }
    const createRequest = event.body as CreateTodoRequest;

    // Auth header parsing
    const userId = extractUserIdFromAuthHeader(event.headers.Authorization);

    const newItem = await createTodo(createRequest, userId);

    return {
      statusCode: 201,
      body: JSON.stringify({ item: newItem }),
    };
  }
);

handler
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  );
