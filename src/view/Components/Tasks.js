import React from 'react'

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {CircularProgress} from 'material-ui/Progress'
import { If, Then, Else } from 'react-if'
import Paper from 'material-ui/Paper'
import Button from 'material-ui/Button'

let tasks = []
let currentId = 0
let inError = false

let tasksInstance

export default class Tasks extends React.Component {
  constructor(props) {
    super(props)

    tasksInstance = this

    this.state = {
      message: "",
      tasks: [],
      isLoading: false,
      isOpen: false,
      action: "",
      bottom: '-40px',
      opened: 0,
      background: '#212121',
      color: '#FFB300'
    }

    this.toggleShowMore = () => {
      if (this.state.opened == 0) {
        this.state.opened = 1
      } else {
        this.state.opened = 0
      }
      this.updateTasks()
    }
  }

  addTask(message) {
    let id = currentId
    tasks.push({message: message, id: id})
    currentId++
    this.updateTasks()
    return id
  }

  finishTask(id) {
    setTimeout(() => {
      tasks = tasks.filter(task => task.id != id)
      this.updateTasks()
    }, 1500)
  }

  showError(message) {
    inError = true
    this.setState({
      message: message,
      tasks: [],
      isLoading: false,
      isOpen: false,
      action: "",
      bottom: 0,
      opened: 0,
      background: '#FFB300',
      color: '#212121'
    })

    setTimeout(() => {
      this.setState({
        background: '#212121',
        color: '#FFB300'
      })
      inError = false
      this.updateTasks()
    }, 2000)
  }

  updateTasks() {
    if (inError)
      return

    let messages = [...new Set(tasks.map(task => task.message))]

    if (messages.length > 1) {
      this.setState({
        message: `${messages.length} tasks running`,
        tasks: messages,
        isLoading: true,
        isOpen: true,
        action: "show",
        bottom: 0
      })
    } else if (messages.length > 0) {
      this.setState({
        message: `${messages[0]}`,
        tasks: messages,
        isLoading: true,
        isOpen: true,
        action: "",
        bottom: 0,
        opened: 0
      })
    } else {
      this.setState({
        message: "Done!",
        isLoading: false,
        opened: 0
      })

      setTimeout(() => {
        this.setState({
          message: "",
          tasks: [],
          isLoading: false,
          isOpen: false,
          action: "",
          bottom: '-40px',
          opened: 0
        })
      }, 1000)
    }

    if (this.state.opened == 1) {
      this.setState({
        action: "hide"
      })
    }
  }

  static getInstance() {
    return tasksInstance
  }

  render() {
    return (
      <Paper className='tasksPanel' style={{
        position: 'fixed',
        margin: 'auto',
        width: '50%',
        right: 0,
        left: 0,
        bottom: this.state.bottom,
        textAlign: 'center',
        height:
        this.state.opened
        * this.state.tasks.length
        * 20
        + this.state.opened
        * 10
        + 40
        + 'px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: this.state.background
      }}>
        <If condition={ this.state.isLoading }>
          <Then><CircularProgress style={{marginLeft: '10px'}} color={this.state.color} size={20} thickness={2}/></Then>
        </If>
        <If condition={ this.state.opened == 0 }>
          <Then><p style={{color: this.state.color, margin: '10px 20px 10px 20px', lineHeight: '20px'}}>{this.state.message}</p></Then>
          <Else>
            <div>{this.state.tasks.map((task, index) => <p key={index} style={{color: this.state.color, margin: '10px 20px 10px 20px', lineHeight: '20px'}}>{task}</p>)}</div>
          </Else>
        </If>

        <If condition={ this.state.action != "" }>
          <Then><Button style={{marginLeft: 'auto', marginRight: '10px'}} label={this.state.action} onTouchTap={() => this.toggleShowMore()}></Button></Then>
          <Else><div style={{marginLeft: 'auto'}}></div></Else>
        </If>
      </Paper>
    )
  }
}
