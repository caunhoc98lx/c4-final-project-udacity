import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()

export async function getAllTodos(): Promise<TodoItem[]> {
  return todoAccess.getAllTodo()
}

export async function getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodosByUserId(userId)
}

export async function createTodo(
  item: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const todoItem: TodoItem = {
    userId,
    todoId,
    name: item.name,
    dueDate: item.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  }
  return todoAccess.createTodo(todoItem)
}

export async function updateTodo(
  userId: string,
  todoId: string,
  item: UpdateTodoRequest
) {
  todoAccess.updateTodo(userId, todoId, item)
}

export async function removeAttachment(
  userId: string,
  todoId: string,
  imageId: string
) {
  todoAccess.removeAttachment(userId, todoId, imageId)
}

export async function deleteTodo(userId: string, todoId: string) {
  todoAccess.deleteTodo(userId, todoId)
}

export async function attachmentImage(userId: string, todoId: string) {
  return todoAccess.attachmentImage(userId, todoId)
}
