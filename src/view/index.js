const React = require('react')
const ReactDOM = require('react-dom')

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import createMuiTheme from 'material-ui/styles/theme'

import {fullBlack, grey, amber} from 'material-ui/styles/colors'

import Main from './main'
import TabsNav from './Components/Pages/TabsNav'
import Tasks from './Components/Tasks'
import createPalette from 'material-ui/styles/palette'

import api from 'node-factorio-api'
api.init("/home/daan/.factorio/mods", false)
api.setSavesPath('/home/daan/.factorio/saves')
api.authenticate({username: 'Danacus', token: '583051c5259eec328eb9ebaa1655a8', require_ownership: true}).then(() => {
  Main.init()

  const { styleManager, theme } = MuiThemeProvider.createDefaultContext({
    theme: createMuiTheme({
      palette: createPalette({
        primary: grey,
        accent: amber,
        error: amber,
        type: 'dark'
      })
    })
  })


  ReactDOM.render(
    <MuiThemeProvider theme={theme} styleManager={styleManager}>
      <div>
        <TabsNav></TabsNav>
        <Tasks></Tasks>
      </div>
    </MuiThemeProvider>,
    document.getElementById('root')
  )
})
