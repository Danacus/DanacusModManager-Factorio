import api from 'node-factorio-api'
import {toJS} from 'immutable'

export const saver = (state, dispatch) => {
  let array = []
  let obj = state.getIn(['mods', 'installed']).toJS()

  for (let key in obj) {
    array.push(obj[key])
  }
  api.saveModList(array)
}
