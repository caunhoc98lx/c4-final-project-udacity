import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Card
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'
import { toast } from 'react-toastify'
import { FILTER } from '../config'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
  filterStatus: string
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    filterStatus: FILTER.ALL
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      if (this.state.newTodoName.trim()) {
        const newTodo = await createTodo(this.props.auth.getIdToken(), {
          name: this.state.newTodoName.trim(),
          dueDate
        })
        this.setState({
          todos: [...this.state.todos, newTodo],
          newTodoName: ''
        })
        toast.success('Task created!')
      } else {
        toast.error("Task input can't blank. Please valid input!!!")
      }
    } catch {
      toast.error('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter((todo) => todo.todoId !== todoId)
      })
    } catch {
      toast.error('Todo deletion failed')
    }
  }

  onChangeFilter = async (filter: string) => {
    const todos = await getTodos(this.props.auth.getIdToken(), filter)
    this.setState({
      todos,
      loadingTodos: false,
      filterStatus: filter
    })
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
      toast.error('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      toast.error(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>
        {this.renderCreateTodoInput()}
        <h2 style={{ fontSize: 'bold' }}>Status</h2>
        <Button
          inverted
          color="blue"
          onClick={() => this.onChangeFilter(FILTER.ALL)}
        >
          {FILTER.ALL}
        </Button>{' '}
        <Button
          inverted
          color="olive"
          onClick={() => this.onChangeFilter(FILTER.TODO)}
        >
          {FILTER.TODO}
        </Button>{' '}
        <Button
          inverted
          color="green"
          onClick={() => this.onChangeFilter(FILTER.DONE)}
        >
          {FILTER.DONE}
        </Button>
        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            value={this.state.newTodoName}
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
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
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <>
        <h2 style={{ paddingTop: '30px' }}>List task: </h2>
        <Grid padded>
          <Grid.Row columns={3}>
            {this.state.todos.map((todo, pos) => {
              return (
                <Grid.Column columns={3} key={todo.todoId}>
                  <Card key={todo.todoId}>
                    {todo.attachmentUrl && (
                      <Image
                        src={todo.attachmentUrl}
                        size="medium"
                        wrapped
                        ui={false}
                      />
                    )}
                    <Card.Content>
                      <Card.Header>
                        <span>
                          <Checkbox
                            onChange={() => this.onTodoCheck(pos)}
                            checked={todo.done}
                          />
                        </span>{' '}
                        {todo.name}
                      </Card.Header>
                      <Card.Meta>
                        <span className="date">{todo.dueDate}</span>
                      </Card.Meta>
                      <Card.Description>
                        <span>Status: </span>{' '}
                        {todo.done ? (
                          <Button
                            basic
                            color="green"
                            onClick={() => this.onChangeFilter(FILTER.DONE)}
                          >
                            {FILTER.DONE}
                          </Button>
                        ) : (
                          <Button
                            basic
                            color="olive"
                            onClick={() => this.onChangeFilter(FILTER.TODO)}
                          >
                            {FILTER.TODO}
                          </Button>
                        )}
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <div className="ui two buttons">
                        <Button
                          icon
                          color="blue"
                          onClick={() => this.onEditButtonClick(todo.todoId)}
                        >
                          <Icon name="pencil" />
                        </Button>
                        <Button
                          icon
                          color="red"
                          onClick={() => this.onTodoDelete(todo.todoId)}
                        >
                          <Icon name="delete" />
                        </Button>
                      </div>
                    </Card.Content>
                  </Card>
                </Grid.Column>
              )
            })}
          </Grid.Row>
        </Grid>
      </>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
