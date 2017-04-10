import React from 'react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from 'material-ui/Table';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField'
import Checkbox from 'material-ui/Checkbox'
import {CircularProgress} from 'material-ui/Progress'
import $ from 'jquery'
import { If, Then, Else } from 'react-if'

import ModManager from '../../../core/modManager'

let installedMods

export default class InstalledMods extends React.Component {

  constructor(props) {
    super(props)
    installedMods = this

    this.state = {
      tableData: []
    }

    this.toggleMod = (row) => {
      this.state.tableData[row].enabled = !this.state.tableData[row].enabled
      ModManager.changeTable(this.state.tableData)
    }

    this.toggleAll = () => {
      let enabled = this.allEnabled()

      this.state.tableData = this.state.tableData.map(mod => {
        mod.enabled = !enabled
        return mod
      })
      ModManager.changeTable(this.state.tableData)
    }

    this.allEnabled = () => {
      let enabled = true

      this.state.tableData.forEach(mod => {
        if (!mod.enabled) {
          enabled = false
        }
      })

      return enabled
    }
  }

  static getInstance() {
    return installedMods
  }

  setTable(table) {
    this.setState({
      tableData: table
    })
  }

  componentWillMount() {
    ModManager.requestUpdate()
    window.removeEventListener('resize', () => this.handleResize())
  }
  componentDidMount() {
    window.addEventListener('resize', () => this.handleResize())
  }
  handleResize(e) {
    this.setState({
      height: $(window).height(),
      width: $(window).width()
    });
  }

  render() {
    return (/*
      <div>
        <Table
          height={`${this.state.height - 100}px`}
          fixedHeader={true}
          selectable={true}
          multiSelectable={true}
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}
            enableSelectAll={true}
          >
            <TableRow key={-1}>
              <TableRowColumn
                style={{
                  width: '20px'
                }}
              >
                <Checkbox
                  checked={this.allEnabled()}
                  onClick={(event, checked) => this.toggleAll()}
                />
              </TableRowColumn>
              <TableRowColumn><strong>Title</strong></TableRowColumn>
              <TableRowColumn><strong>Name</strong></TableRowColumn>
              <TableRowColumn><strong>Installed Version</strong></TableRowColumn>
              <TableRowColumn><strong>Latest Version</strong></TableRowColumn>
              <TableRowColumn
                style={{
                  width: '150px'
                }}
              >
                <TextField
                  hintText="Search"
                  hintStyle={{
                    color: '#FFB300'
                  }}
                  underlineStyle={{
                    borderColor: 'rgba(255, 179, 0, 0.701961)'
                  }}
                  underlineFocusStyle={{
                    borderColor: '#FFB300'
                  }}
                  fullWidth={false}
                  style={{
                    width: '140px'
                  }}
                  onChange={(event, value) => ModManager.searchInstalledMod(value)}
                />
              </TableRowColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            deselectOnClickaway={false}
            showRowHover={false}
            stripedRows={false}
            displayRowCheckbox={false}
          >
            {this.state.tableData.map((row, index) => (
              <TableRow key={index}>
                <TableRowColumn
                  style={{
                    width: '20px'
                  }}
                >
                  <Checkbox
                    checked={row.enabled}
                    onClick={(event, checked) => this.toggleMod(index)}
                  />
                </TableRowColumn>
                <TableRowColumn>{row.title}</TableRowColumn>
                <TableRowColumn>{row.name}</TableRowColumn>
                <TableRowColumn>{row.version}</TableRowColumn>
                <TableRowColumn>{row.latest_release.version}</TableRowColumn>
                <TableRowColumn
                  style={{
                    width: '150px'
                  }}
                >
                  <If condition={row.hasUpdate == true}>
                    <Then><Button label="Update" onTouchTap={() => ModManager.updateMod({name: row.name, version: row.version})} /></Then>
                  </If>
                </TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>*/
      <Table
        height={`${this.state.height - 100}px`}
      >
        <TableHead>
          <TableRow>
            <TableCell><strong>Title</strong></TableCell>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Installed Version</strong></TableCell>
            <TableCell><strong>Latest Version</strong></TableCell>
            <TableCell
              style={{
                width: '150px'
              }}
            >
              <TextField
                placeholder="Search"
                onChange={(event, value) => ModManager.searchInstalledMod(value)}
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.tableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell
                style={{
                  width: '20px'
                }}
              >
                <Checkbox
                  checked={row.enabled}
                  onClick={(event, checked) => this.toggleMod(index)}
                />
              </TableCell>
              <TableCell>{row.title}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.version}</TableCell>
              <TableCell>{row.latest_release.version}</TableCell>
              <TableCell
                style={{
                  width: '150px'
                }}
              >
                <If condition={row.hasUpdate == true}>
                  <Then><Button label="Update" onTouchTap={() => ModManager.updateMod({name: row.name, version: row.version})} /></Then>
                </If>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}
