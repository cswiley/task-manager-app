import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import {
  createAttachmentPresignedUrl,
  updateTodoAttachmentUrl,
} from "../../businessLayer/todos";
import { extractUserIdFromAuthHeader } from "../../auth/utils";
const bucketName = process.env.ATTACHMENT_S3_BUCKET;

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = extractUserIdFromAuthHeader(event.headers.Authorization);

    // Return a presigned URL to upload a file for a TODO item with the provided id
    const presignedUrl = createAttachmentPresignedUrl(todoId);
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`;
    updateTodoAttachmentUrl(todoId, userId, attachmentUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: presignedUrl,
      }),
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
