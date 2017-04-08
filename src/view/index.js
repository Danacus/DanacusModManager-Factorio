const React = require('react')
const ReactDOM = require('react-dom')

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import {fullBlack, grey500, grey600, grey700, grey800, grey900, amber500, amber600, amber700} from 'material-ui/styles/colors'

import Main from './main'
import TabsNav from './Components/Pages/TabsNav'
import Tasks from './Components/Tasks'

import api from 'node-factorio-api'
api.init("/home/daan/.factorio/mods", false)
api.setSavesPath('/home/daan/.factorio/saves')
api.authenticate({username: 'Danacus', token: '583051c5259eec328eb9ebaa1655a8', require_ownership: true}).then(() => {
  Main.init()

  const muiTheme = getMuiTheme({
    palette: {
      primary1Color: grey600,
      primary2Color: grey700,
      primary3Color: grey800,
      accent1Color: amber500,
      accent2Color: grey700,
      accent3Color: amber600,
      textColor: amber600,
      alternateTextColor: amber600,
      canvasColor: grey800,
      borderColor: grey800,
      pickerHeaderColor: amber500,
      shadowColor: fullBlack,
    },
    appBar: {
      height: 50,
    },
  })


  ReactDOM.render(
    <MuiThemeProvider muiTheme={muiTheme}>
      <div>
        <TabsNav></TabsNav>
        <Tasks></Tasks>
      </div>
    </MuiThemeProvider>,
    document.getElementById('root')
  )
})
