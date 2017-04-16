import React from 'react'
import SwipeableViews from 'react-swipeable-views'
import { Grid, Row, Col } from 'react-flexbox-grid'
import './Tabs.scss'


export default class TabsContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      index: this.props.index
    }
  }

  handleTabChange (index) {
    this.setState({index})
    this.props.onChange(index)
  }

  render () {
    return (
      <div className='container'>
        <Row className='tabs'>
          {
            React.Children.map(this.props.children, (child, index) => {
              let className
              if (index == this.state.index) {
                className = 'tab active'
              } else {
                className = 'tab'
              }

              const props = {
                onClick: () => this.handleTabChange(index),
                className
              }

              return (
                <Col xs={6} sm={3} {...props}>
                  {child}
                  <div className='lineContainer'>
                    <div className='line'></div>
                  </div>
                </Col>
              )
            })
          }
        </Row>
      </div>
    )
  }
}
