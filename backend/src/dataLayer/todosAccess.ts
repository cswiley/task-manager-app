import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient, Key } from "aws-sdk/clients/dynamodb";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { GetTodosResponse } from "../response/GetTodosResponse";
import { decodeLastEvaluatedKey, encodeLastEvaluatedKey } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const XAWS = AWSXRay.captureAWS(AWS);

export class TodoAccess {
  private readonly docClient: AWS.DynamoDB.DocumentClient;
  private readonly todosTable: string;
  private readonly todosDueDateIndex: string;

  constructor() {
    this.docClient = createDynamoDBClient();
    this.todosTable = process.env?.TODOS_TABLE ?? "";
    this.todosDueDateIndex = process.env?.TODOS_DUE_DATE_INDEX ?? "";
  }

  async getAllTodos(
    userId: string,
    lastKey?: string,
    done?: boolean,
    priority?: string,
    limit?: number
  ): Promise<GetTodosResponse> {
    const decodedKey: Key | undefined = decodeLastEvaluatedKey(lastKey);

    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: this.todosTable,
      IndexName: this.todosDueDateIndex,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      Limit: limit, // Set the desired number of items per page
      ExclusiveStartKey: decodedKey,
      ScanIndexForward: true, // Retrieve items in descending order
    };
    if (params.ExpressionAttributeValues === undefined) {
      params.ExpressionAttributeValues = {};
    }
    if (done !== undefined) {
      if (params.FilterExpression === undefined) {
        params.FilterExpression = "";
      } else {
        params.FilterExpression += " AND ";
      }
      params.FilterExpression += "done = :done";
      params.ExpressionAttributeValues[":done"] = done;
    }
    if (priority !== undefined) {
      if (params.FilterExpression === undefined) {
        params.FilterExpression = "";
      } else {
        params.FilterExpression += " AND ";
      }
      params.FilterExpression += "priority = :priority";
      params.ExpressionAttributeValues[":priority"] = priority;
    }
    const result = await this.docClient.query(params).promise();

    let items = result.Items;
    if (result.Items && result.Items.length) {
      items = result.Items.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, ...otherFields } = item;
        return otherFields;
      });
    }

    const encodedKey = encodeLastEvaluatedKey(result.LastEvaluatedKey);
    return {
      items: items as TodoItem[],
      lastKey: encodedKey,
    };
  }

  async getTodo(userId: string, todoId: string): Promise<TodoItem | null> {
    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: this.todosTable,
      KeyConditionExpression: "userId = :userId AND todoId = :todoId",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":todoId": todoId,
      },
    };
    const result = await this.docClient.query(params).promise();
    if (result.Items && result.Items.length) {
      return result.Items[0] as TodoItem;
    }
    return null;
  }

  async getTodoCount(
    userId: string,
    done?: boolean,
    priority?: string
  ): Promise<number> {
    const params = {
      TableName: this.todosTable,
      Select: "COUNT",
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    if (done !== undefined) {
      params.FilterExpression += " AND done = :done";
      params.ExpressionAttributeValues[":done"] = done;
    }
    if (priority !== undefined) {
      params.FilterExpression += " AND priority = :priority";
      params.ExpressionAttributeValues[":priority"] = priority;
    }

    const response = await this.docClient.scan(params).promise();
    return response.Count ?? 0;
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem,
      })
      .promise();

    return todoItem;
  }

  async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate) {
    const key = {
      userId,
      todoId,
    };
    const params = {
      TableName: this.todosTable,
      Key: key,
      UpdateExpression: "set #attr1 = :val1, #attr2 = :val2, #attr3 = :val3",
      ExpressionAttributeNames: {
        "#attr1": "name",
        "#attr2": "dueDate",
        "#attr3": "done",
      },
      ExpressionAttributeValues: {
        ":val1": todoUpdate.name,
        ":val2": todoUpdate.dueDate,
        ":val3": todoUpdate.done,
      },
    };
    await this.docClient.update(params).promise();
  }

  async updateTodoAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ) {
    const key = {
      userId,
      todoId,
    };
    const params = {
      TableName: this.todosTable,
      Key: key,
      UpdateExpression: "set #attr1 = :val1",
      ExpressionAttributeNames: {
        "#attr1": "attachmentUrl",
      },
      ExpressionAttributeValues: {
        ":val1": attachmentUrl,
      },
    };
    await this.docClient.update(params).promise();
  }

  async deleteTodo(todoId: string, userId: string): Promise<string> {
    const key = {
      userId,
      todoId,
    };
    const params = {
      TableName: this.todosTable,
      Key: key,
      ConditionExpression:
        "attribute_exists(userId) AND attribute_exists(todoId)",
    };

    await this.docClient.delete(params).promise();
    return todoId;
  }
}

function createDynamoDBClient(): DocumentClient {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return new XAWS.DynamoDB.DocumentClient();
}
