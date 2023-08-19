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
  loadingTodos: boolean
  currentPage: number
  itemsPerPage: number
  pageKey: any
  lastKey: string
  totalPages: number
  totalItems: number
  nameError: boolean
  dateError: boolean
  priorityError: boolean
  priority: string
  priorityFilter: string
  statusFilter: string
  date: Date
  task: string
  isSubmit: boolean
  imageSize: boolean[]
}

const priorityOptions = [
  { key: 'l', text: 'Low', value: 'low' },
  { key: 'm', text: 'Medium', value: 'medium' },
  { key: 'h', text: 'High', value: 'high' }
]

const priorityFilterOptions = [
  { key: '', text: 'Any', value: '' },
  ...priorityOptions
]

const statusFilterOptions = [
  { key: '', text: 'Any', value: '' },
  { key: 'false', text: 'Not done', value: 'false' },
  { key: 'true', text: 'Done', value: 'true' }
]

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    loadingTodos: true,
    currentPage: 1,
    itemsPerPage: 5,
    pageKey: {},
    lastKey: '',
    totalPages: 1,
    totalItems: 0,
    nameError: false,
    dateError: false,
    priorityError: false,
    priority: 'low',
    date: new Date(),
    task: '',
    isSubmit: false,
    priorityFilter: '',
    statusFilter: '',
    imageSize: []
  }

  handleImageSize = (todoId: number) => {
    const imageSize = [...this.state.imageSize]
    imageSize[todoId] = !imageSize[todoId]
    this.setState({ imageSize: imageSize })
  }

  handleSubmit = async () => {
    const nameError = !this.state.task
    const dateError = !this.state.date
    if (nameError || dateError) {
      this.setState({
        nameError,
        dateError
      })
      return
    }
    try {
      this.setState({ isSubmit: true })
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.task,
        priority: this.state.priority,
        dueDate: this.formatDate(this.state.date)
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        task: '',
        date: new Date(),
        priority: 'low'
      })
    } catch {
      alert('Todo creation failed')
    } finally {
      this.setState({
        isSubmit: false
      })
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

  handlePriorityFilterChange = (
    e: React.SyntheticEvent<HTMLElement>,
    data: any
  ) => {
    const { value } = data
    this.setState({ priorityFilter: value })
    this.getPage(1, '', value, this.state.statusFilter)
  }

  handleStatusFilterChange = (
    e: React.SyntheticEvent<HTMLElement>,
    data: any
  ) => {
    const { value } = data
    this.setState({ statusFilter: value })
    this.getPage(1, '', this.state.priorityFilter, value)
  }

  handleDateChange = (event: any, data: any) => {
    let dateError = data.value === null
    if (!dateError) {
      const currentIsoDate = new Date(
        new Date().setHours(0, 0, 0, 0)
      ).toISOString()
      const selectedIsoDate = new Date(
        new Date(data.value).setHours(0, 0, 0, 0)
      ).toISOString()
      if (selectedIsoDate < currentIsoDate) {
        dateError = true
      }
    }
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

    this.getPage(page, key, this.state.priorityFilter, this.state.statusFilter)
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
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
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

  getPage = async (page: number, key = '', priority = '', status = '') => {
    const todos = await getTodos(
      this.props.auth.getIdToken(),
      key,
      priority,
      status
    )
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
        <div className='mb-20'>{this.renderCreateTodoInput()}</div>

        <Header as='h2' className='font-bold mb-2'>
          Tasks ({this.state.totalItems ?? 0})
        </Header>
        <div className='md:flex'>
          <div className='flex items-center mt-8'>
            <p className='mb-0 mr-2'>Filter by Priority:</p>
            <Form.Select
              placeholder='Any'
              options={priorityFilterOptions}
              value={this.state.priorityFilter}
              onChange={this.handlePriorityFilterChange}
              search
              selection
              clearable
            />
          </div>
          <div className='flex items-center mt-8 md:ml-8'>
            <p className='mb-0 mr-2'>Filter by status:</p>
            <Form.Select
              placeholder='Any'
              options={statusFilterOptions}
              value={this.state.statusFilter}
              onChange={this.handleStatusFilterChange}
              search
              selection
              clearable
            />
          </div>
        </div>
        <div className='mt-16 mb-8'>{this.renderTodos()}</div>

        <div className='flex items-center'>
          {this.renderPagination()}
          <p className='font-bold ml-8'>
            Page {this.state.currentPage} of {this.state.totalPages}
          </p>
        </div>
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
    const dateThreshold = new Date(new Date().setHours(0, 0, 0, 0))
    return (
      <SemanticDatepicker
        name='date'
        value={this.state.date}
        onChange={this.handleDateChange}
        error={this.state.dateError}
        filterDate={date => {
          return date >= dateThreshold
        }}
      />
    )
  }

  renderCreateTodoInput() {
    const { task, priority } = this.state
    return (
      <div className='border border-gray-400 p-8'>
        <Form onSubmit={this.handleSubmit}>
          <div className='mb-4'>
            <div>Task name</div>
            <Form.Input
              fluid
              name='task'
              value={task}
              placeholder='Enter task...'
              onChange={this.handleTaskChange}
              error={this.state.nameError}
            />
            {this.state.nameError && (
              <p className='text-red-500'>Please enter a value.</p>
            )}
          </div>
          <Form.Group className='gap-x-4 gap-y-4 md:gap-y-0'>
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
                name='priority'
                options={priorityOptions}
                simple
                value={priority}
                onChange={this.handlePriorityChange}
                error={this.state.priorityError}
              />
              {this.state.priorityError && (
                <p className='text-red-500'>Please select a priority.</p>
              )}
            </Form.Field>
          </Form.Group>
          <div className='mt-8'>
            {this.state.isSubmit && (
              <Button loading primary>
                loading
              </Button>
            )}
            {!this.state.isSubmit && (
              <Button type='submit' color='blue'>
                Add Todo
              </Button>
            )}
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

  renderPriority(priority: string) {
    if (priority === 'low') {
      return <span className='px-4 py-1 bg-green-500'>low</span>
    } else if (priority === 'medium') {
      return <span className='px-4 py-1 bg-yellow-500'>med</span>
    } else {
      return <span className='px-4 py-1 bg-red-500'>high</span>
    }
  }

  renderTodosList() {
    return (
      <div className='max-w-full overflow-x-scroll'>
        <div>
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
                  <div className='min-w-50 md:flex-shrink md:flex-auto flex items-center text-left px-8'>
                    {todo.attachmentUrl && (
                      <div className='pr-4'>
                        {this.state.imageSize[pos] === true && (
                          <div>
                            <div>{todo.name}</div>
                            <div
                              className='cursor-pointer'
                              onClick={() => this.handleImageSize(pos)}
                            >
                              <Image
                                className='fixed'
                                src={todo.attachmentUrl}
                                size='large'
                                wrapped
                              />
                            </div>
                          </div>
                        )}
                        {this.state.imageSize[pos] !== true && (
                          <div className='flex'>
                            <div
                              className='cursor-pointer'
                              onClick={() => this.handleImageSize(pos)}
                            >
                              <Image
                                src={todo.attachmentUrl}
                                size='tiny'
                                wrapped
                              />
                            </div>
                            <div className='pl-4'>{todo.name}</div>
                          </div>
                        )}
                      </div>
                    )}
                    {!todo.attachmentUrl && <div>{todo.name}</div>}
                  </div>
                  <div className='flex items-center flex-shrink w-auto px-8'>
                    {this.renderPriority(todo.priority)}
                  </div>
                  <div className='flex items-center flex-shrink-0 w-auto px-8'>
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
