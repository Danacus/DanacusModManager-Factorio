import React from 'react'

import { If, Then, Else } from 'react-if'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog';

let instance

export default class ModManagerDialog extends React.Component {
  constructor(props) {
    super(props)
    instance = this

    this.state = {
      title: "",
      message: "",
      open: false
    }

    this.handleClose = () => {
      this.setState({
        open: false
      })
    }
  }

  showDialog(title, message, buttons) {
    return new Promise((resolve, reject) => {
      this.setState({
        title,
        message,
        open: true,
        actions: buttons.map(button =>
          <FlatButton
            label={button}
            onTouchTap={() => {
              this.handleClose()
              resolve(button)
            }}
          />
        )
      })
    })
  }

  static getInstance() {
    return instance
  }

  render() {
    return (
      <Dialog
        title={this.state.title}
        actions={this.state.actions}
        modal={true}
        open={this.state.open}
        contentStyle={{
          whiteSpace: 'pre-line'
        }}
      >
        {this.state.message}
      </Dialog>
    )
  }
}
