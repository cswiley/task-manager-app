export interface Todo {
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  priority: string
  done: boolean
  attachmentUrl?: string
}
