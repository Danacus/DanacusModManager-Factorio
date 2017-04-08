import React from 'react'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'
import Checkbox from 'material-ui/Checkbox'
import {CircularProgress} from 'material-ui/Progress'
import $ from 'jquery'
import { If, Then, Else } from 'react-if'
import semver from 'semver'
import IconButton from 'material-ui/IconButton'
import {Menu, MenuItem} from 'material-ui/Menu'
import ModInfo from './ModInfo'

import ModManager from '../../../core/modManager'
import api from 'node-factorio-api'

let onlineMods

export default class InstalledMods extends React.Component {

  constructor(props) {
    super(props)
    onlineMods = this

    this.state = {
      tableData: [],
      height: $(window).height(),
      width: $(window).width()
    }
  }

  static getInstance() {
    return onlineMods
  }

  setTable(table) {
    this.setState({
      tableData: table
    })
  }

  componentWillMount() {
    window.removeEventListener('resize', () => this.handleResize())
  }
  componentDidMount() {
    window.addEventListener('resize', () => this.handleResize())
  }
  handleResize(e) {
    this.setState({
      height: $(window).height(),
      width: $(window).width()
    })
  }

  render() {
    return (
      <div>
        <Table
          height={`${this.state.height - 100}px`}
          fixedHeader={true}
          selectable={true}
          multiSelectable={true}
          className='onlineModsTable'
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}
            enableSelectAll={true}
          >
            <TableRow key={-1}>
              <TableRowColumn><strong>Title</strong></TableRowColumn>
              <TableRowColumn><strong>Name</strong></TableRowColumn>
              <TableRowColumn
                style={{
                  width: '80px'
                }}
              >
                <strong>Installed Version</strong>
              </TableRowColumn>
              <TableRowColumn
                style={{
                  width: '80px'
                }}
              >
                <strong>Latest Version</strong>
              </TableRowColumn>
              <TableRowColumn
                style={{
                  width: '80px'
                }}
              >
                <strong>Downloads</strong>
              </TableRowColumn>
              <TableRowColumn
                style={{
                  width: '90px'
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
                    width: '110px'
                  }}
                  onChange={(event, value) => ModManager.searchOnlineMod(value)}
                />
              </TableRowColumn>
              <TableRowColumn
                style={{
                  width: '20px'
                }}
              >
                <Menu
                  iconButtonElement={
                    <IconButton
                      iconClassName="material-icons"
                      onTouchTap={() => {}}
                      >sort
                    </IconButton>
                  }
                  anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                  targetOrigin={{horizontal: 'right', vertical: 'top'}}
                >
                  <MenuItem primaryText="Most Downloads" onTouchTap={() => ModManager.changeOnlineModsSort('top')} />
                  <MenuItem primaryText="Alphabetically" onTouchTap={() => ModManager.changeOnlineModsSort('alpha')} />
                  <MenuItem primaryText="Recently Updated" onTouchTap={() => ModManager.changeOnlineModsSort('updated')} />
                </Menu>

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
                <TableRowColumn>{row.title}</TableRowColumn>
                <TableRowColumn>{row.name}</TableRowColumn>
                <TableRowColumn
                  style={{
                    width: '80px'
                  }}
                  >
                    {row.version}
                </TableRowColumn>
                <TableRowColumn
                  style={{
                    width: '80px'
                  }}
                >
                    {row.latest_release.version}
                </TableRowColumn>
                <TableRowColumn
                  style={{
                    width: '80px'
                  }}
                >
                  {row.downloads_count}
                </TableRowColumn>
                <TableRowColumn
                  style={{
                    width: '90px'
                  }}
                >
                  <If condition={row.hasUpdate}>
                    <Then><Button label="Update" onTouchTap={() => {
                      ModManager.updateMod(row)
                    }} /></Then>
                    <Else><Button label="Download" onTouchTap={() => {
                      let mod = row
                      mod.version = row.latest_release.version
                      ModManager.downloadMod(mod)
                    }} /></Else>
                  </If>
                </TableRowColumn>
                <TableRowColumn
                  style={{
                    width: '20px'
                  }}
                >
                  <IconButton
                    iconClassName="material-icons"
                    style={{
                      marginTop: '2px'
                    }}
                    onTouchTap={() => {
                      api.getMod(row.name).then((mod) => {
                        ModInfo.getInstance().open(mod)
                      })
                    }}
                    >more_vert
                  </IconButton>
                </TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ModInfo />
      </div>
    )
  }
}
