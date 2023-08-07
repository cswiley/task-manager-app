import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { deleteTodo } from "../../businessLayer/todos";
import { extractUserIdFromAuthHeader } from "../../auth/utils";
import createHttpError from "http-errors";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters || !event.pathParameters.todoId) {
      throw new createHttpError.BadRequest("Todo Id is not defined");
    }
    const todoId = event.pathParameters.todoId;

    const userId = extractUserIdFromAuthHeader(event.headers.Authorization);
    await deleteTodo(todoId, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Todo deleted successfully",
      }),
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
