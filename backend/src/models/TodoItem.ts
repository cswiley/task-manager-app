export interface TodoItem {
  todoId: string;
  createdAt: string;
  name: string;
  dueDate: string;
  done: boolean;
  priority: string;
  attachmentUrl?: string;
}
