import { TodoAccess } from "../dataLayer/todosAccess";
import { AttachmentUtils } from "../helpers/attachmentUtils";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { createLogger } from "../utils/logger";
import * as uuid from "uuid";
import { GetTodosResponse } from "../response/GetTodosResponse";
import createHttpError from "http-errors";

const todoAccess = new TodoAccess();
const attachmentUtils = new AttachmentUtils();
const logger = createLogger("todos");
const QUERY_LIMIT = 20;
const DEFAULT_PRIORITY = "low";

/**
 * Retrieves all todo items for a specific user.
 *
 * @param userId - The user ID associated with the todo items.
 * @returns A Promise that resolves to an array of todo items.
 * @throws {Error} If an error occurs during the retrieval process.
 */
export async function getAllTodos(
  userId: string,
  lastKey?: string,
  done?: string,
  priority?: string,
  limit?: number
): Promise<GetTodosResponse> {
  // Limit set to max value when value is not within valid range
  if (
    limit === undefined ||
    isNaN(limit) ||
    limit <= 0 ||
    limit > QUERY_LIMIT
  ) {
    limit = QUERY_LIMIT;
  }

  if (limit <= 0 || limit > QUERY_LIMIT) {
    logger.error(`Invalid limit value: ${limit}`);
    throw new createHttpError.InternalServerError("Invalid limit range");
  }

  // const totalItems = await getTodosCount(userId);
  let doneValue: boolean | undefined;
  if (done === "true") {
    doneValue = true;
  } else if (done === "false") {
    doneValue = false;
  }

  try {
    const todosResponse: GetTodosResponse = await todoAccess.getAllTodos(
      userId,
      lastKey,
      doneValue,
      priority,
      limit
    );

    const count = await getTodosCount(userId, doneValue, priority);

    todosResponse.itemsLimit = limit;
    todosResponse.totalItems = count;

    while (
      todosResponse.items.length < count &&
      todosResponse.items.length < limit &&
      todosResponse.lastKey !== undefined
    ) {
      // query by lastKey
      const nextTodosResponse = await todoAccess.getAllTodos(
        userId,
        todosResponse.lastKey,
        doneValue,
        priority,
        limit
      );
      // append next response to results
      todosResponse.items = [
        ...todosResponse.items,
        ...nextTodosResponse.items,
      ];
      // update last key
      todosResponse.lastKey = nextTodosResponse.lastKey;
    }

    return todosResponse;
  } catch (error: unknown) {
    logger.error("Error in getAllTodos", { error });
    throw error;
  }
}

export async function getTodo(userId: string, todoId: string) {
  try {
    return await todoAccess.getTodo(userId, todoId);
  } catch (error: unknown) {
    logger.error("Error in getTodo", { error });
    throw error;
  }
}

export async function getTodosCount(
  userId: string,
  done?: boolean,
  priority?: string
) {
  try {
    return await todoAccess.getTodoCount(userId, done, priority);
  } catch (error: unknown) {
    logger.error("Error in getTodosCount", { error });
    throw error;
  }
}

/**
 * Creates a new todo item for a specific user.
 *
 * @param createTodoRequest - The request object containing todo details.
 * @param userId - The user ID associated with the todo.
 * @returns A Promise that resolves to the created todo item.
 * @throws {Error} If an error occurs during todo creation or server communication.
 */
export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const itemId: string = uuid.v4();

  const todoParams = {
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate,
    priority: createTodoRequest.priority || DEFAULT_PRIORITY,
    done: false,
    attachmentUrl: "",
  };

  try {
    return await todoAccess.createTodo(todoParams);
  } catch (error: unknown) {
    logger.error("Error in createTodo", { error });
    throw error;
  }
}

/**
 * Updates a todo item for a specific user.
 *
 * @param todoId - The ID of the todo item to update.
 * @param userId - The user ID associated with the todo item.
 * @param updateTodoRequest - The request object containing the updated todo details.
 * @throws {Error} If an error occurs during the update process.
 */
export async function updateTodo(
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  try {
    const result = await todoAccess.getTodo(userId, todoId);
    if (result === null) {
      throw "Todo item not found";
    }
    await todoAccess.updateTodo(todoId, userId, updateTodoRequest);
  } catch (error: unknown) {
    logger.error("Error in updateTodo", { error });
    throw error;
  }
}

export async function updateTodoAttachmentUrl(
  todoId: string,
  userId: string,
  attachmentUrl: string
) {
  try {
    await todoAccess.updateTodoAttachmentUrl(todoId, userId, attachmentUrl);
  } catch (error: unknown) {
    logger.error("Error in updateTodoAttachmentUrl", { error });
    throw error;
  }
}

/**
 * Deletes a todo item for a specific user.
 *
 * @param todoId - The ID of the todo item to delete.
 * @param userId - The user ID associated with the todo item.
 * @returns A Promise that resolves to a success message if the deletion is successful.
 * @throws {Error} If the todo item is not found, or if an error occurs during the deletion process.
 */
export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<string> {
  try {
    return await todoAccess.deleteTodo(todoId, userId);
  } catch (error: unknown) {
    logger.error("Error in deleteTodo", { error });
    throw error;
  }
}

export function createAttachmentPresignedUrl(id: string): string {
  try {
    return attachmentUtils.getUploadUrl(id);
  } catch (error: unknown) {
    logger.error("Error in createAttachmentPresignedUrl", { error });
    throw error;
  }
}
