import UserData from './userData'
import {fromJS} from 'immutable'
import shortid from 'shortid'
import jetpack from 'fs-jetpack'
import path from 'path'
import api from 'node-factorio-api'
import {remote} from 'electron'
const {app} = remote

export const setUserData = userData => (
  {
    type: 'SET_USER_DATA',
    userData
  }
)

export const addInstalledMods = installedMods => (
  {
    type: 'ADD_INSTALLED_MODS',
    installedMods
  }
)

export const addOnlineMods = onlineMods => (
  {
    type: 'ADD_ONLINE_MODS',
    onlineMods
  }
)

export const setPagination = pagination => (
  {
    type: 'SET_PAGINATION',
    pagination
  }
)

export const enableMod = name => (
  {
    type: 'ENABLE_MOD',
    saveModList: true,
    name
  }
)

export const disableMod = name => (
  {
    type: 'DISABLE_MOD',
    saveModList: true,
    name
  }
)

export const loadInstalledMods = () => dispatch => {
  const id = shortid.generate()
  dispatch(startTask(id, 'Loading installed mods'))
  return api.loadInstalledMods().then(installedMods => {
    dispatch(endTask(id))
    dispatch(addInstalledMods(installedMods))
  }).catch((err) => {
    dispatch(endTask(id, err))
  })
}

export const loadOnlineMods = (page, order) => dispatch => {
  const id = shortid.generate()
  dispatch(startTask(id, 'Loading online mods'))
  return api.searchMods({
    page_size: 25,
    page,
    order
  }).then(body => {
    dispatch(endTask(id))
    dispatch(setPagination(body.pagination))
    dispatch(addOnlineMods(body.results))
  }).catch((err) => {
    dispatch(endTask(id, err))
  })
}

export const loadUserDataAuto = () => dispatch => {
  const userDataPath = path.join(app.getPath('userData'), 'user-data.json')
  if (jetpack.exists(userDataPath)) {
    const id = shortid.generate()
    dispatch(startTask(id, 'Loading user data'))
    return Promise.resolve().then(() =>{
      dispatch(endTask(id))
      dispatch(setUserData(jetpack.read(userDataPath, 'json')))
    })
  } else {
    dispatch(loadUserData())
  }
}

export const loadUserData = () => dispatch => {
  const id = shortid.generate()
  dispatch(startTask(id, 'Loading user data'))
  UserData.load().then(userData => {
    dispatch(endTask(id))
    dispatch(saveUserData(userData))
  }).catch(err =>
    dispatch(endTask(id, err))
  )
}

export const saveUserData = userData => dispatch => {
  const id = shortid.generate()
  dispatch(startTask(id, 'Saving user data'))
  return UserData.save(fromJS(userData)).then(() => {
    dispatch(endTask(id))
    dispatch(setUserData(userData))
  }).catch((err) =>
    dispatch(endTask(id, err))
  )
}

export const startTask = (id, message) => (
  {
    type: 'START_TASK',
    id,
    message
  }
)

export const endTask = (id, error) => (
  {
    type: 'END_TASK',
    id,
    state: error ? 'ERROR' : 'SUCCESS',
    error
  }
)
