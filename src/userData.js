import jetpack from 'fs-jetpack'
import {homedir} from 'os'
import path from 'path'
import {remote} from 'electron'
import {toJS} from 'immutable'
const {app, dialog} = remote

const filePaths = {
  playerDataPaths: [
    // Linux
    path.join(app.getPath('home'), '.factorio', 'player-data.json'),
    path.join(app.getPath('home'), '.Factorio', 'player-data.json'),
    path.join(app.getPath('home'), 'Factorio', 'player-data.json'),
    path.join(app.getPath('home'), 'factorio', 'player-data.json'),

    // Windows
    path.join(app.getPath('appData'), 'Factorio', 'player-data.json'),
    path.join('C:\\', 'Program Files', 'Factorio', 'player-data.json'),
    path.join('C:\\', 'Program Files (x86)', 'Factorio', 'player-data.json')
  ],
  modPaths: [
    // Linux
    path.join(app.getPath('home'), '.factorio', 'mods'),
    path.join(app.getPath('home'), '.Factorio', 'mods'),
    path.join(app.getPath('home'), 'Factorio', 'mods'),
    path.join(app.getPath('home'), 'factorio', 'mods'),

    // Windows
    path.join(app.getPath('appData'), 'Factorio', 'mods'),
    path.join('C:\\', 'Program Files', 'Factorio', 'mods'),
    path.join('C:\\', 'Program Files (x86)', 'Factorio', 'mods')
  ],
  savePaths: [
    // Linux
    path.join(app.getPath('home'), '.factorio', 'saves'),
    path.join(app.getPath('home'), '.Factorio', 'saves'),
    path.join(app.getPath('home'), 'Factorio', 'saves'),
    path.join(app.getPath('home'), 'factorio', 'saves'),

    // Windows
    path.join(app.getPath('appData'), 'Factorio', 'saves'),
    path.join('C:\\', 'Program Files', 'Factorio', 'saves'),
    path.join('C:\\', 'Program Files (x86)', 'Factorio', 'saves')
  ],
  executablePaths: [
    // Linux
    path.join(app.getPath('home'), '.factorio', 'bin', 'x64', 'factorio'),
    path.join(app.getPath('home'), '.factorio', 'bin', 'i386', 'factorio'),
    path.join(app.getPath('home'), 'factorio', 'bin', 'x64', 'factorio'),
    path.join(app.getPath('home'), 'factorio', 'bin', 'i386', 'factorio'),
    path.join(app.getPath('home'), '.Factorio', 'bin', 'x64', 'factorio'),
    path.join(app.getPath('home'), '.Factorio', 'bin', 'i386', 'factorio'),
    path.join(app.getPath('home'), 'Factorio', 'bin', 'x64', 'factorio'),
    path.join(app.getPath('home'), 'Factorio', 'bin', 'i386', 'factorio'),
    path.join(app.getPath('home'), '.local', 'share', 'Steam', 'steamapps', 'common', 'Factorio', 'bin', 'x64', 'factorio'),
    path.join(app.getPath('home'), '.local', 'share', 'Steam', 'steamapps', 'common', 'Factorio', 'bin', 'i386', 'factorio'),

    // Windows
    path.join('C:\\', 'Program Files', 'Factorio', 'bin', 'Win32', 'factorio.exe'),
    path.join('C:\\', 'Program Files', 'Factorio', 'bin', 'x64', 'factorio.exe'),
    path.join('C:\\', 'Program Files (x86)', 'Factorio', 'bin', 'Win32', 'factorio.exe'),
    path.join('C:\\', 'Program Files (x86)', 'Factorio', 'bin', 'x64', 'factorio.exe'),
    path.join('C:\\', 'Program Files', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'Win32', 'factorio.exe'),
    path.join('C:\\', 'Program Files', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'x64', 'factorio.exe'),
    path.join('C:\\', 'Program Files (x86)', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'Win32', 'factorio.exe'),
    path.join('C:\\', 'Program Files (x86)', 'Steam', 'SteamApps', 'common', 'Factorio', 'bin', 'x64', 'factorio.exe')
  ]
}

export default class UserData {
  static load() {
    return new Promise((resolve, reject) => {
      let promises = []
      for (let key in filePaths) {
        promises.push(searchPaths(key, filePaths[key]))
      }
      Promise.all(promises).then((pathArrays) => {
        pathArrays.forEach(pathArray => {
          filePaths[pathArray.name] = pathArray.paths
        })

        let askPathPromises = []

        for (let key in filePaths) {
          if (filePaths[key].length == 0) {
            askPathPromises.push(askPath(key))
          }
        }
        return Promise.all(askPathPromises)
      }).then((pathArrays) => {
        pathArrays.forEach(pathArray => {
          filePaths[pathArray.name] = pathArray.paths
        })
        return jetpack.readAsync(filePaths.playerDataPaths[0], 'json')
      }).then(playerData => {
        let account = {}
        account.username = playerData['service-username']
        account.token = playerData['service-token']
        if (account.username && account.token) {
          resolve({paths: filePaths, account: account})
        } else {
          reject('Cannot load player data!')
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }

  static save(userDataState) {
    return jetpack.writeAsync(path.join(app.getPath('userData'), 'user-data.json'), userDataState.toJS())
  }
}

const askPath = name =>
  new Promise((resolve, reject) => {
    let title
    let properties

    switch (name) {
      case 'playerDataPaths':
        title = 'Find player-data.json',
        properties = []
        break
      case 'modPaths':
        title = 'Find mods folder',
        properties = ["openDirectory"]
        break
      case 'savePaths':
        title = 'Find saves folder',
        properties = ["openDirectory"]
        break
      case 'executablePaths':
        title = 'Find factorio executable',
        properties = []
        break
      default:

    }

    dialog.showOpenDialog({
      title,
      properties
    }, paths => {
      if(paths === undefined){
        reject("No destination folder selected")
        return
      } else {
        resolve({name, paths})
      }
    })
  })

const searchPaths = (name, paths) =>
  new Promise((resolve, reject) => {
    let promises = paths.map(path => jetpack.existsAsync(path))
    let existingPaths = []
    Promise.all(promises).then((values) => {
      values.forEach((value, index) => {
        if (value) {
          existingPaths.push(paths[index])
        }
      })
      resolve({name: name, paths: existingPaths})
    })
  })
