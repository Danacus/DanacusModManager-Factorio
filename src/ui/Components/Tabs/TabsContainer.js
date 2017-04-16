import React from 'react'
import SwipeableViews from 'react-swipeable-views'
import { Grid, Row, Col } from 'react-flexbox-grid'
import './TabsContainer.scss'

import Tabs from './Tabs'

import {InstalledMods} from '../Pages/InstalledMods'

export default class TabsContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      index: 0
    }
  }

  handleTabChange(index) {
    this.setState({index})
  }

  render () {
    return (
      <div>
        <Tabs index={this.state.index} onChange={index => this.handleTabChange(index)}>
          <div>
            News
          </div>
          <div>
            Installed Mods
          </div>
          <div>
            Online Mods
          </div>
          <div>
            Modpacks
          </div>
        </Tabs>
        <SwipeableViews index={this.state.index}>
          <div>
            slide n°1
          </div>
          <div>
          <InstalledMods />
          </div>
          <div>
            slide n°3
          </div>
          <div>
            slide n°4
          </div>
        </SwipeableViews>
      </div>
    )
  }
}
