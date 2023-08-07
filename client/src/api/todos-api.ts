import { apiEndpoint } from '../config'
import { Todo } from '../types/Todo'
import { CreateTodoRequest } from '../types/CreateTodoRequest'
import Axios, { AxiosError } from 'axios'
import { UpdateTodoRequest } from '../types/UpdateTodoRequest'

function handleAxiosError(error: any): void {
  if (error.isAxiosError) {
    const axiosError: AxiosError = error
    if (axiosError.response) {
      // Error with a response from the server
      const status = axiosError.response.status
      const data = axiosError.response.data
      console.log('Error:', status, data)
    } else if (axiosError.request) {
      // Error without a response
      console.log('No response received:', axiosError.request)
      console.log('Error message:', axiosError.message)
    } else {
      console.log('Error message:', axiosError.message)
    }
  } else {
    // Other errors
    console.log('Error:', error)
  }
}

export async function getTodos(
  idToken: string,
  key: string,
  limit: number = 10
): Promise<any> {
  try {
    const response = await Axios.get(`${apiEndpoint}/todos`, {
      params: {
        lastKey: key,
        limit: limit
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    })
    return {
      items: response.data.items,
      lastKey: response.data.lastKey ?? '',
      totalItems: response.data.totalItems,
      itemsLimit: response.data.itemsLimit
    }
  } catch (error) {
    handleAxiosError(error)
    throw error
  }
}

export async function createTodo(
  idToken: string,
  newTodo: CreateTodoRequest
): Promise<Todo> {
  try {
    const response = await Axios.post(
      `${apiEndpoint}/todos`,
      JSON.stringify(newTodo),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        }
      }
    )
    return response.data.item
  } catch (error) {
    handleAxiosError(error)
    throw error
  }
}

export async function patchTodo(
  idToken: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<void> {
  try {
    await Axios.patch(
      `${apiEndpoint}/todos/${todoId}`,
      JSON.stringify(updatedTodo),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        }
      }
    )
  } catch (error) {
    handleAxiosError(error)
    throw error
  }
}

export async function deleteTodo(
  idToken: string,
  todoId: string
): Promise<void> {
  try {
    await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    })
  } catch (error) {
    handleAxiosError(error)
  }
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  try {
    const response = await Axios.post(
      `${apiEndpoint}/todos/${todoId}/attachment`,
      '',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        }
      }
    )
    return response.data.uploadUrl
  } catch (error) {
    handleAxiosError(error)
    throw error
  }
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  try {
    await Axios.put(uploadUrl, file)
  } catch (error) {
    handleAxiosError(error)
    throw error
  }
}
