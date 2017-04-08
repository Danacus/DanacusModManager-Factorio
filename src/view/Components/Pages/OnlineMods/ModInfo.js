import React from 'react'
import Drawer from 'material-ui/Drawer'
import Dialog from 'material-ui/Dialog'
import Button from 'material-ui/Button'
import {List, ListItem} from 'material-ui/List'
import renderHTML from 'react-render-html'
import ModManager from '../../../core/modManager'
import {Menu, MenuItem} from 'material-ui/Menu'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import { If, Then, Else } from 'react-if'

let instance

export default class ModInfo extends React.Component {

  constructor(props) {
    super(props)
    instance = this
    this.state = {open: false, selectedRelease: 0, mod: {releases:[], media_files:[{urls: {}}], description_html:"<p></p>"}}
  }

  static getInstance() {
    return instance
  }

  setMod(mod) {
    this.setState({
      mod: mod
    })
  }

  open(mod) {
    let media = [{urls: {}}]
    if (mod.media_files.length > 0) {
      media = mod.media_files
    }
    mod.media_files = media
    this.setState({
      open: true,
      selectedRelease: 0,
      mod: mod
    })
  }

  close() {
    this.setState({
      open: false
    })
  }

  selectVersion(event, index, value) {
    this.setState({
      selectedRelease: value
    })
  }

  render() {
    const actions = [
      <Button
        label="Close"
        primary={false}
        onTouchTap={() => this.close()}
      />
    ]

    return (
      <div>
        <Dialog
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={() => this.close()}
          autoScrollBodyContent={true}
        >
          <Card onExpandChange={() => this.setState({})}>
            <CardMedia
              style={{minHeight: '400px'}}
               overlay={<CardTitle title={this.state.mod.title} subtitle={"By " + this.state.mod.owner} />}
            >
              <img src={this.state.mod.media_files[0].urls.original} />
            </CardMedia>
            <CardActions>
              <Menu iconStyle={{fill: '#FFB300'}} maxHeight={200} value={this.state.selectedRelease} onChange={(e, i, v) => this.selectVersion(e, i, v)}>
                  {this.state.mod.releases.map((release, index) => (
                    <MenuItem value={index} key={index} primaryText={release.version} />
                  ))}
              </Menu>
              <Button style={{position: 'absolute', marginTop: '8px'}} label="Download" onTouchTap={() => {
                let mod = this.state.mod
                mod.version = this.state.mod.releases[this.state.selectedRelease].version
                ModManager.downloadMod(mod)
              }} />
            </CardActions>
            <CardText>
              Name: {this.state.mod.name}<br />
              Homepage: <a href={this.state.mod.homepage}>{this.state.mod.homepage}</a><br />
              <br />
              {renderHTML(this.state.mod.description_html)}
            </CardText>
          </Card>
        </Dialog>
      </div>
    );
  }
}

/*
Title: {this.state.mod.title}<br />
Name: {this.state.mod.name}<br />
Author: {this.state.mod.owner}<br />
Homepage: <a href={this.state.mod.homepage}>{this.state.mod.homepage}</a><br />
<List><ListItem primaryText="Description" onNestedListToggle={() => this.setState({})} nestedItems={[(
  <ListItem key={0} primaryText={renderHTML(this.state.mod.description_html)} />
)]} /></List>
<List><ListItem primaryText="Releases" onNestedListToggle={() => this.setState({})} nestedItems={this.state.mod.releases.map((release, index) => (
  <ListItem key={index} primaryText={release.version} rightIcon={
    <Button onTouchTap={() => {
      let mod = this.state.mod
      mod.version = release.version
      ModManager.downloadMod(mod)
    }}>
      <span style={{fontSize: '12px', marginTop: '-18px', marginLeft: '-32px', position: 'absolute'}}>DOWNLOAD</span>
    </Button>}
  />
))} /></List>
*/
