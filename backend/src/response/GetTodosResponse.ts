import { TodoItem } from "../models/TodoItem";

export interface GetTodosResponse {
  items: TodoItem[];
  totalItems?: number;
  itemsLimit?: number;
  lastKey?: string;
}
