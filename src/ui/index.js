import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import api from 'node-factorio-api'
import App from './App'
import './index.scss'
import {toJS} from 'immutable'
import {createStore, applyMiddleware} from 'redux'
import {composeWithDevTools} from 'remote-redux-devtools'
import reducer from '../reducer'
import shortid from 'shortid'
import {
  loadUserDataAuto,
  logError,
  loadInstalledMods,
  loadOnlineMods,
  startTask,
  endTask,
} from '../action_creators'
import {saver} from '../actor_save'

const composeEnhancers = composeWithDevTools({ realtime: true })
const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)))

const actors = [saver]

const id = shortid.generate()
store.dispatch(startTask(id, 'Initializing'))

store.dispatch(loadUserDataAuto()).then(() => {
  let userData = store.getState().getIn(['userData'])
  api.init(
    false,
    userData.getIn(['paths', 'modPaths']).first(),
    userData.getIn(['paths', 'savePaths']).first()
  )

  return api.authenticate({
    username: userData.getIn(['account', 'username']),
    token: userData.getIn(['account', 'token'])
  })
}).then(token => {
  return store.dispatch(loadInstalledMods())
}).then(() => {
  ReactDOM.render(
    <Provider store={store}>
      <App/>
    </Provider>,
    document.getElementById('root')
  )
  return store.dispatch(loadOnlineMods(1, 'top'))
}).then(() => {
  store.dispatch(endTask(id))
  let acting = false
  store.subscribe(() => {
    if (!acting) {
      acting = true
      actors.forEach(actor => {
        actor(store.getState(), store.dispatch)
      })
      acting = false
    }
  })
}).catch((err) => {
  store.dispatch(endTask(id, err))
})
