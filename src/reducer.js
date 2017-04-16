import {
  setLoginData,
  setPaths,
  addInstalledMods,
  addOnlineMods,
  setUserData,
  logError,
  removeError,
  setPagination,
  startTask,
  endTask,
  enableMod,
  disableMod,
  INITIAL_STATE
} from './core'

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'SET_USER_DATA':
      return setUserData(state, action.userData)
    case 'ADD_INSTALLED_MODS':
      return state.update('mods', modsState => addInstalledMods(modsState, action.installedMods))
    case 'ADD_ONLINE_MODS':
      return state.update('mods', modsState => addOnlineMods(modsState, action.onlineMods))
    case 'LOG_ERROR':
      return logError(state, action.error, action.id)
    case 'REMOVE_ERROR':
      return removeError(state, action.id)
    case 'SET_PAGINATION':
      return setPagination(state, action.pagination)
    case 'START_TASK':
      return startTask(state, action.id, action.message)
    case 'END_TASK':
      return endTask(state, action.id, action.state, action.error)
    case 'ENABLE_MOD':
      return enableMod(state, action.name)
    case 'DISABLE_MOD':
      return disableMod(state, action.name)
  }
  return state;
}
