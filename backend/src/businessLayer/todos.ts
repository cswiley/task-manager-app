import { TodoAccess } from "../dataLayer/todosAccess";
import { AttachmentUtils } from "../helpers/attachmentUtils";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { createLogger } from "../utils/logger";
import * as uuid from "uuid";
import * as createError from "http-errors";

const todoAccess = new TodoAccess();
const attachmentUtils = new AttachmentUtils();
const logger = createLogger("todos");

/**
 * Retrieves all todo items for a specific user.
 *
 * @param userId - The user ID associated with the todo items.
 * @returns A Promise that resolves to an array of todo items.
 * @throws {Error} If an error occurs during the retrieval process.
 */
export async function getAllTodos(
  userId: string,
  lastKey: string,
  limit: number
): Promise<any> {
  try {
    return await todoAccess.getAllTodos(userId, lastKey, limit);
  } catch (error) {
    logger.error("Error in getAllTodos", { error });
    throw new createError.InternalServerError(error);
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
  logger.info("Creating new todo");

  const itemId = uuid.v4();

  const todoParams = {
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: "",
  };

  try {
    return await todoAccess.createTodo(todoParams);
  } catch (error) {
    logger.error("Error in createTodo", { error });
    throw new createError.InternalServerError(error);
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
  logger.info("Updating todo:", { todoId });
  try {
    await todoAccess.updateTodo(todoId, userId, updateTodoRequest);
  } catch (error) {
    logger.error("Error in updateTodo", { error });
    throw new createError.InternalServerError(error);
  }
}

export async function updateTodoAttachmentUrl(
  todoId: string,
  userId: string,
  attachmentUrl: string
) {
  try {
    await todoAccess.updateTodoAttachmentUrl(todoId, userId, attachmentUrl);
  } catch (error) {
    logger.error("Error in updateTodoAttachmentUrl", { error });
    throw new createError.InternalServerError(error);
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
  logger.info("Deleting todo:", { todoId });
  try {
    return await todoAccess.deleteTodo(todoId, userId);
  } catch (error) {
    logger.error("Error in deleteTodo", { error });
    if (error.code === "ConditionalCheckFailedException") {
      throw new createError.NotFound("Item not found");
    }
    logger.error("Failed to delete todo:", { todoId });
    throw new createError.InternalServerError(error);
  }
}

export function createAttachmentPresignedUrl(id: string): string {
  try {
    return attachmentUtils.getUploadUrl(id);
  } catch (error) {
    logger.error("Error in createAttachmentPresignedUrl", { error });
    throw new createError.InternalServerError(error);
  }
}
