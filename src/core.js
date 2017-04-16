import {List, Map, fromJS} from 'immutable'

export const INITIAL_STATE = new Map({
  userData: new Map(),
  mods: new Map()
})

export const setUserData = (state, userData) =>
  state.set('userData', fromJS(userData))

export const addInstalledMods = (modsState, installedMods) => {
  let installedModsObj = {}
  installedMods.forEach(mod => {
    installedModsObj[mod.name] = mod
  })
  return modsState.mergeIn(['installed'], fromJS(installedModsObj))
}

export const addOnlineMods = (modsState, onlineMods) => {
  let onlineModsObj = {}
  onlineMods.forEach(mod => {
    onlineModsObj[mod.name] = mod
  })
  return modsState.mergeIn(['online'], fromJS(onlineModsObj))
}

export const setPagination = (state, pagination) =>
  state.set('pagination', pagination)

export const startTask = (state, id, message) =>
  state.mergeIn(['tasks'], fromJS({[id]: {message, state: 'PENDING'}}))

export const endTask = (state, id, taskState, error) =>
  state.mergeIn(['tasks', id], {state: taskState, error})

export const enableMod = (state, name) =>
  state.setIn(['mods', 'installed', name, 'enabled'], true)

export const disableMod = (state, name) =>
  state.setIn(['mods', 'installed', name, 'enabled'], false)
