import rp from 'request-promise'
import semver from 'semver'
const jetpack = require('fs-jetpack')
const path = require('path')
const JSZip = require('jszip')
const request = require('request');
const progress = require('request-progress');

class FactorioAPI {
  static init(modPath, allowMultipleVersions = false) {
    this.token = null
    this.username = null
    this.modPath = modPath
    this.allowMultipleVersions = allowMultipleVersions
    this.authenticated = false
  }

  static setModsPath(modPath) {
    this.modPath = modPath
  }

  static setSavesPath(savePath) {
    this.savePath = savePath
  }

  static isAuthenticated() {
    return this.authenticated
  }

  // ------------------------
  // Authenication with username and password/token
  static authenticate(props) {
    return new Promise((resolve, reject) => {
      props.require_ownership = typeof props.require_ownership !== 'undefined' ? props.require_ownership : false
      if (props.username && props.token) {
        this.token = props.token
        this.username = props.username
        this.authenticated = true
        resolve(props.token)
      } else if (props.username && props.password) {
        let options = {
            method: 'POST',
            uri: 'https://auth.factorio.com/api-login',
            qs: {
                username: props.username,
                password: props.password,
                require_ownership: props.require_ownership
            },
            json: true
        }

        rp(options).then((body) => {
          this.username = body[0]
          this.authenticated = true
          resolve(body[0])
        }).catch((err) => {
          reject(err)
        })
      } else {
        reject("Error: Insufficient information")
      }
    })
  }

  // ------------------------
  // Mod Portal
  // More information: https://wiki.factorio.com/Mod_Portal_API
  static getMod(name) {
    return new Promise((resolve, reject) => {
      let options = {
          method: 'GET',
          uri: `https://mods.factorio.com/api/mods/${name}`,
          json: true
      }

      rp(options).then((body) => {
        if (body.detail === 'Not found.') {
          reject('Error: Mod not found')
        } else {
          resolve(body)
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }

  static getMods(mods) {
    let promises = mods.map(mod => getMod(mod.name))
    return Promise.all(promises)
  }

  static searchMods(props) {
    return new Promise((resolve, reject) => {
      let options = {
          method: 'GET',
          uri: `https://mods.factorio.com/api/mods`,
          qs: props,
          json: true
      }

      rp(options).then((body) => {
        resolve(body)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  // ------------------------
  // mods = [{name: {name}, version: {current version}}]
  static updateMods(mods, factorioVersion = "0.0.0") {
    let promises = mods.map((mod) => {
      return this.updateMod(mod, factorioVersion)
    })

    return Promise.all(promises)
  }

  // ------------------------
  /*
  mod = {
    name: {name},
    version: {current version}
  }
  */
  static updateMod(mod, factorioVersion = "0.0.0") {
    return new Promise((resolve, reject) => {
      this.checkUpdate(mod, factorioVersion).then((result) => {
        if (result.hasUpdate) {
          console.log("Updating mod");
          this.downloadMod({name: mod.name, version: result.releases[0].version}).then(() => {
            resolve(result)
          }).catch((err) => {
            reject(err)
          })
        } else {
          console.log("Up-to-date");
          resolve(result)
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }

  static checkUpdate(mod, factorioVersion = "0.0.0") {
    return this.getMod(mod.name).then((onlineMod) => {
      if (semver.gt(onlineMod.releases[0].version, mod.version)
        && (semver.major(onlineMod.releases[0].version) == semver.major(factorioVersion) || factorioVersion == "0.0.0")) {
        onlineMod.hasUpdate = true
        return onlineMod
      } else {
        onlineMod.hasUpdate = false
        return onlineMod
      }
    })
  }

  static checkUpdates(mods, factorioVersion = "0.0.0") {
    let promises = mods.map((mod) => this.checkUpdate(mod, factorioVersion))
    return Promise.all(promises)
  }

  // ------------------------
  // mods = [{name: {name}, version: {version you want to download}}]
  static downloadMods(mods) {
    let promises = mods.map(mod => this.downloadMod(mod))
    return Promise.all(promises)
  }

  // ------------------------
  /*
  mod = {
    name: {name},
    version: {version you want to download}
  }
  */
  static downloadMod(mod) {
    return new Promise((resolve, reject) => {
      this.getMod(mod.name).then((onlineMod) => {
        let release

        if (mod.version) {
          release = onlineMod.releases.find(x => x.version == mod.version)
        } else {
          release = onlineMod.releases[0]
        }

        this.downloadModFromUrl(release.download_url).then(() => {
          resolve(onlineMod)
        }).catch((err) => {
          reject(err)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }

  // ------------------------
  // url = {download_url property from release}
  // (example: /api/downloads/data/mods/id/name_version.zip)
  static downloadModFromUrl(url) {
    return new Promise((resolve, reject) => {
      let fullUrl = 'https://mods.factorio.com' + url + `?username=${this.username}&token=${this.token}`
      let fileName = url.substr(url.lastIndexOf('/') + 1);
      let name = fileName.replace(fileName.substr(fileName.lastIndexOf('_')), '')


      progress(request(fullUrl))
      .on('error', (err) => {
          reject(err)
      })
      .on('end', () => {
        if (!this.allowMultipleVersions) {
          jetpack.findAsync(this.modPath, { matching: `${name}_*.zip`}).then((files) => {
            let promises = []

            files.forEach((file) => {
              if (path.basename(file) != fileName) {
                promises.push(jetpack.removeAsync(file))
              }
            })

            Promise.all(promises).then(() => {
              resolve(name)
            }).catch((err) => {
              reject(err)
            })
          })
        } else {
          resolve(name)
        }
      })
      .pipe(jetpack.createWriteStream(path.join(this.modPath, fileName)))
    })
  }

  static removeModsMatching(mod) {
    return new Promise((resolve, reject) => {
      let promises = []

      if (!mod.version) {
        mod.version = "*"
      }

      jetpack.findAsync(this.modPath, { matching: `${mod.name}_${mod.version}.zip`}).then((files) => {
        files.forEach((file) => {
          promises.push(jetpack.removeAsync(file))
        })
      })

      Promise.all(promises).then(() => {
        resolve()
      })
    })
  }

  static removeMods(mods) {
    return Promise.all(mods.map(mod => this.removeModsMatching(mod)))
  }

  static downloadDependencies(mod, optionalMods = false) {
    return new Promise((resolve, reject) => {
      this.getDependencies(mod, optionalMods).then((dependencies) => {
        return this.downloadMods(dependencies)
      }).then((mods) => {
        resolve(mods)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  static getDependencies(mod, optionalMods = false) {
    return new Promise((resolve, reject) => {
      this.getMod(mod.name).then((onlineMod) => {
        let release

        if (mod.version) {
          release = onlineMod.releases.find(x => x.version == mod.version)
        } else {
          release = onlineMod.releases[0]
        }

        let dependencies = release.info_json.dependencies

        if (!optionalMods) {
          // Ignore "base" and dependencies that start with "?"
          dependencies = dependencies.filter(x => x[0] != "?" && x.substring(0, 4) != "base")
        } else {
          dependencies = dependencies.map(x => {
            if (x[0] == "?") {
              // Remove "? "
              return x.substring(2)
            } else {
              return x
            }
          })

          // Ignore "base"
          dependencies = dependencies.filter(x => x.substring(0, 4) != "base")
        }

        // Ignore version number, only look at name and create object with name
        dependencies = dependencies.map(x => { return {name: x.split(" ")[0]}})
        resolve(dependencies)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  // ------------------------
  // Matchmaking
  // More information: https://wiki.factorio.com/Matchmaking_API
  static getGames() {
    let options = {
        method: 'GET',
        uri: 'https://multiplayer.factorio.com/get-games',
        qs: {
            username: this.username,
            token: this.token
        },
        json: true
    }

    return rp(options)
  }

  // Get more details from a game
  // gameId can be retrieved from getGames()
  static getGameDetails(gameId) {
    let options = {
        method: 'GET',
        uri: `https://multiplayer.factorio.com/get-game-details/${gameId}`,
        json: true
    }

    return rp(options)
  }

  // Get mods from level-init.dat (in save zip archive)
  static getModsFromSaveFile(fileName, resolveFileName = false) {
    return new Promise((resolve, reject) => {
      let file = path.join(this.savePath, fileName)
      jetpack.readAsync(file, 'buffer').then((buf) => {
        JSZip.loadAsync(buf)
        .then((zip) => {
          return zip.file(/level-init\.dat/)[0].async('nodebuffer')
        })
        .then((buffer) => {
          let mods = []
          let modCount = buffer.readUIntBE(48, 1)
          for (var i = modCount, pos = 52; i > 0; i--) {
            let length = buffer.readUIntBE(pos, 1)

            let modName = buffer.toString('utf-8', pos, pos + length + 2).trim()
            let vMajor = buffer.readUIntBE(pos + length + 1, 1)
            let vMinor = buffer.readUIntBE(pos + length + 2, 1)
            let vPatch = buffer.readUIntBE(pos + length + 3, 1)

            let fullVersion = 'v' + vMajor + '.' + vMinor + '.' + vPatch

            // Remove non-ASCII characters
            modName = modName.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')

            mods.push({name: modName, version: fullVersion})

            pos += length + 4
          }

          if (resolveFileName) {
            resolve({name: fileName.replace('.zip', ''), mods: mods})
          } else {
            resolve(mods)
          }
        })
        .catch((err) => {
          reject(err)
        })
      })
    })
  }

  static getModsFromSave(saveName) {
    let fileName = `${saveName}.zip`
    return this.getModsFromSaveFile(fileName)
  }

  static getModsFromSaves() {
    return new Promise((resolve, reject) => {
      jetpack.findAsync(this.savePath, { matching: '*.zip' }).then((files) => {
        Promise.all(files.map(x => this.getModsFromSaveFile(path.basename(x), true))).then((list) => {
          resolve(list)
        }).catch((err) => {
          reject(err)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }

  static readModZipFile(fileName) {
    return new Promise((resolve, reject) => {
      let file = path.join(this.modPath, fileName)
      jetpack.readAsync(file, 'buffer')
      .then((buffer) => {
        JSZip.loadAsync(buffer)
        .then((zip) => {
          return zip.file(/info\.json/)[0].async('text')
        })
        .then((data) => {
          data = JSON.parse(data)
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
      })
      .catch((err) => {
        reject(err)
      })
    })
  }

  static readModZip(mod) {
    let fileName = `${mod.name}_${mod.version}.zip`
    return readModZipFile(fileName)
  }

  static readModZips() {
    return new Promise((resolve, reject) => {
      jetpack.findAsync(this.modPath, { matching: '*_*.zip' }).then((files) => {
        Promise.all(files.map(x => this.readModZipFile(path.basename(x)))).then((list) => {
          list = list.sort((a, b) => a.name.localeCompare(b.name))
          resolve(list)
        }).catch((err) => {
          reject(err)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }

  static loadInstalledMods() {
    return new Promise((resolve, reject) => {
      this.readModZips().then((list) => {
        jetpack.readAsync(path.join(this.modPath, 'mod-list.json'), 'json').then((modListJson) => {
          list = list.map(mod => {
            let jsonMod = modListJson.mods.find(x => x.name == mod.name)
            if (jsonMod) {
              mod.enabled = (jsonMod.enabled == 'true')
            } else {
              mod.enabled = true
            }
            return mod
          })
          list = list.sort((a, b) => a.name.localeCompare(b.name))
          resolve(list)
        }).catch((err) => {
          reject(err)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }

  static saveModList(mods) {
    mods = mods.map(mod => {return {name: mod.name, enabled: mod.enabled.toString()}})
    return jetpack.writeAsync(path.join(this.modPath, 'mod-list.json'), JSON.stringify({mods: mods}))
  }
}

module.exports = FactorioAPI