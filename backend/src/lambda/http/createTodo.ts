import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";
import { createTodo } from "../../businessLayer/todos";
import { extractUserIdFromAuthHeader } from "../../auth/utils";

/**
 * Handles the Lambda function for creating a new todo item.
 *
 * @param event - The API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 * @throws {Error} If an error occurs during request parsing, authentication header parsing, or todo creation.
 */
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Request parsing
    const newTodo: CreateTodoRequest = JSON.parse(event.body);

    // Auth header parsing
    const userId = extractUserIdFromAuthHeader(event.headers.Authorization);

    const newItem = await createTodo(newTodo, userId);

    return {
      statusCode: 201,
      body: JSON.stringify({ item: newItem }),
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
