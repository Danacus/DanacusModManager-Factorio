import React from 'react'
import $ from 'jquery'

import './Table.scss'
import {toJS} from 'immutable'

export default class Table extends React.Component {
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

  render () {
    let check = <i className="fa fa-check" aria-hidden="true"></i>
    let noCheck = <div />

    const data = this.props.data.map((value, key) =>
      value.map(prop => {
        if (typeof prop === 'boolean') {
          if (prop) {
            return check
          } else {
            return noCheck
          }
        } else {
          return prop
        }
      })
    )

    let totalWidth = 0

    this.props.columns.forEach(col => {
      if (col.width) {
        totalWidth += col.width
      }
    })

    return (

      <table className='table'>
        <thead>
          <tr>
            {this.props.columns.map((col, index) =>
              <th key={index}
                  style={{
                    width: col.width ? col.width : `calc(100% - 90px - ${totalWidth}px)`
                  }}
              >{col.title}</th>
            )}
          </tr>
        </thead>
        <tbody style={{
          maxHeight: ((this.state.height - 120) + 'px'),
        }}>
          {data.map((mod, key) =>
            <tr key={key} onClick={e => this.props.onClickRow(key)}>
              {this.props.columns.map((col, index) =>
                <td key={index}
                    style={{
                      width: col.width ? col.width : `calc(100% - 90px - ${totalWidth}px)`
                    }}
                >{mod.get(col.name)}</td>
              )}
            </tr>
          )}
        </tbody>
      </table>
    )
  }
}
