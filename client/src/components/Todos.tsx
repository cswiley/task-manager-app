import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import SemanticDatepicker from 'react-semantic-ui-datepickers'
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css'
import {
  Form,
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Pagination,
  PaginationProps
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
  currentPage: number
  itemsPerPage: number
  pageKey: any
  lastKey: string
  totalPages: number
  totalItems: number
  priority: string
  task: string
  date: Date
  nameError: boolean
  dateError: boolean
  priorityError: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    currentPage: 1,
    itemsPerPage: 5,
    pageKey: {},
    lastKey: '',
    totalPages: 1,
    totalItems: 0,
    priority: '',
    task: '',
    date: new Date(),
    nameError: false,
    dateError: false,
    priorityError: false
  }

  handleSubmit = async () => {
    const nameError = !this.state.task
    const dateError = !this.state.date
    let priorityError = !this.state.priority
    if (nameError || dateError || priorityError) {
      this.setState({
        nameError,
        dateError,
        priorityError
      })
      return
    }
    try {
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.task,
        priority: this.state.priority,
        dueDate: this.formatDate(this.state.date)
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }
  handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>, data: any) => {
    const nameError = !data.value
    this.setState({ task: data.value, nameError: nameError })
  }

  handlePriorityChange = (e: React.SyntheticEvent<HTMLElement>, data: any) => {
    const { value } = data
    const priorityError = !value
    this.setState({ priority: value, priorityError: priorityError })
  }

  handleDateChange = (event: any, data: any) => {
    const dateError = data.value === null
    this.setState({
      date: data.value,
      dateError: dateError
    })
  }

  handlePageChange = (
    event: React.MouseEvent<HTMLAnchorElement>,
    data: PaginationProps
  ) => {
    // Handle page change logic here
    const page = data.activePage as number
    const key = this.state.pageKey[page] ?? ''

    this.getPage(page, key)
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  getPage = async (page: number, key = '') => {
    const todos = await getTodos(this.props.auth.getIdToken(), key)
    const totalPages = Math.floor(todos.totalItems / todos.itemsLimit) + 1
    let { pageKey } = this.state
    pageKey[page + 1] = todos.lastKey

    this.setState({
      currentPage: page,
      todos: todos.items,
      pageKey: pageKey,
      totalPages: totalPages,
      totalItems: todos.totalItems,
      loadingTodos: false,
      date: new Date()
    })
  }

  componentDidMount() {
    try {
      this.getPage(this.state.currentPage)
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div className='pt-4 font-bold'>
        <Header as='h1' className='font-bold'>
          TODOs ({this.state.totalItems ?? 0})
        </Header>

        {this.renderCreateTodoInput()}

        <div className='mt-8'>{this.renderTodos()}</div>

        <p className='font-bold'>
          Page {this.state.currentPage} of {this.state.totalPages}
        </p>
        {this.renderPagination()}
      </div>
    )
  }

  renderPagination() {
    return (
      <Grid.Row>
        <Pagination
          firstItem={null}
          lastItem={null}
          ellipsisItem={null}
          siblingRange={0}
          boundaryRange={0}
          onPageChange={this.handlePageChange}
          defaultActivePage={1}
          totalPages={this.state.totalPages}
        />
      </Grid.Row>
    )
  }

  renderDatePicker() {
    return (
      <SemanticDatepicker
        value={this.state.date}
        onChange={this.handleDateChange}
        error={this.state.dateError}
      />
    )
  }

  renderCreateTodoInput() {
    const options = [
      { key: 'l', text: 'Low', value: 'low' },
      { key: 'm', text: 'Medium', value: 'medium' },
      { key: 'h', text: 'High', value: 'high' }
    ]
    return (
      <div className='border border-gray-400 p-8'>
        <Form onSubmit={this.handleSubmit}>
          <div className='mb-4'>
            <div>Task name</div>
            <Input
              fluid
              name='task'
              placeholder='Enter task...'
              onChange={this.handleTaskChange}
              error={this.state.nameError}
            />
            {this.state.nameError && (
              <p className='text-red-500'>Please enter a value.</p>
            )}
          </div>
          <Form.Group className='gap-x-4'>
            <Form.Field>
              <div>Due date</div>
              {this.renderDatePicker()}
              {this.state.dateError && (
                <p className='text-red-500'>Please select a date.</p>
              )}
            </Form.Field>
            <Form.Field>
              <div>Priority</div>
              <Form.Select
                options={options}
                placeholder='Select...'
                onChange={this.handlePriorityChange}
                error={this.state.priorityError}
              />
              {this.state.priorityError && (
                <p className='text-red-500'>Please select a priority.</p>
              )}
            </Form.Field>
          </Form.Group>
          <div className='mt-8'>
            <Button type='submit'>Submit</Button>
          </div>
        </Form>
      </div>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline='centered'>
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <div>
        {/* <div className='w-full'>
          <div className='flex w-full'>
            <div className='flex items-center flex-shrink w-auto'>Status</div>
            <div className='flex-auto flex items-center text-left px-8'>
              &nbsp;
            </div>
            <div className='flex items-center flex-shrink w-auto px-8'>
              Date
            </div>
            <div className='flex items-center flex-shrink w-auto'>Here</div>
          </div>
        </div> */}
        {this.state.todos.map((todo, pos) => {
          return (
            <div className='w-full' key={todo.todoId}>
              <div className='flex w-full'>
                <div className='flex items-center flex-shrink w-auto'>
                  <Checkbox
                    className='mt-1'
                    toggle
                    onChange={() => this.onTodoCheck(pos)}
                    checked={todo.done}
                  />
                </div>
                <div className='flex-auto flex items-center text-left px-8'>
                  {todo.name}
                  {todo.attachmentUrl && (
                    <div className='pl-4'>
                      <Image src={todo.attachmentUrl} size='small' wrapped />
                    </div>
                  )}
                </div>
                <div className='flex items-center flex-shrink w-auto px-8'>
                  {todo.dueDate}
                </div>
                <div className='flex items-center flex-shrink w-auto'>
                  <Button
                    icon
                    color='blue'
                    onClick={() => this.onEditButtonClick(todo.todoId)}
                  >
                    <Icon name='pencil' />
                  </Button>
                  <Button
                    icon
                    color='red'
                    onClick={() => this.onTodoDelete(todo.todoId)}
                  >
                    <Icon name='delete' />
                  </Button>
                </div>
              </div>
              <Divider />
            </div>
          )
        })}
      </div>
    )
  }

  formatDate(date: Date): string {
    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
