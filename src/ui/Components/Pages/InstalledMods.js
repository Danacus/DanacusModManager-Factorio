import React from 'react'
import {connect} from 'react-redux'
import {toJS, toArray} from 'immutable'
import $ from 'jquery'
import * as action_creators from '../../../action_creators'

import Table from '../Utils/Table'

import './InstalledMods.scss'

export class _InstalledMods extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      height: $(window).height(),
      width: $(window).width()
    }
  }

  handleTabChange(index) {
    this.setState({index})
  }

  handleResize(e) {
    this.setState({
      height: $(window).height(),
      width: $(window).width()
    })
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.handleResize())
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.handleResize())
  }

  toggleMod(name) {
    if (this.props.mods.getIn([name, 'enabled'])) {
      this.props.disableMod(name)
    } else {
      this.props.enableMod(name)
    }
  }

  render () {
    return (
      <Table
        onClickRow={name => this.toggleMod(name)}
        data={this.props.mods}
        columns={[
        {
          title: 'Name',
          name: 'name',
        },
        {
          title: 'Version',
          name: 'version',
          width: 100
        },
        {
          title: 'Enabled',
          name: 'enabled',
          width: 100
        }
      ]} />
    )
  }
}

function mapStateToProps(state) {
  return {
    mods: state.getIn(['mods', 'installed'])
  }
}

export const InstalledMods = connect(mapStateToProps, action_creators)(_InstalledMods)
