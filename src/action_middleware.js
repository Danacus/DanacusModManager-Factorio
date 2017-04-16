import api from 'node-factorio-api'

export default const saver = store => next => action => {
  let result = next(action)
  api.saveModList
  return result
}
