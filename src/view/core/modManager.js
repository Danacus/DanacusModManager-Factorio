
import InstalledMods from '../Components/Pages/InstalledMods/InstalledMods'
import OnlineMods from '../Components/Pages/OnlineMods/OnlineMods'
import api from 'node-factorio-api'
import Tasks from '../Components/Tasks';
import $ from 'jquery'
import semver from 'semver'
import objectJoin from 'object-join'

export default class ModManager {
  static init() {
    this.mods = []
    this.checkingForUpdates = true
    this.fetchingMods = false
    this.page_count = 0
    this.lastPage = 0
    this.onlineSort = 'top'
    this.onlineQuery = ''
    this.installedQuery = ''
  }

  static loadInstalledMods() {
    let list
    api.loadInstalledMods().then((l) => {
      list = l
      return api.saveModList(list)
    }).then(() => {
      list.forEach((item, i) => {
        item.hasUpdate = false
        if (i >= this.mods.length) {
          this.mods.push({})
        }
        this.mods[i] = objectJoin(this.mods[i], item)
        this.mods[i].latest_release = {}
      })
      this.updateInstalledModsTable()
      this.checkUpdates()
      return this.getPageCount()
    }).then(() => {
      this.clearOnlineModList()
    }).catch((err) => {
      Tasks.getInstance().showError("Error! " + err)
      console.error(err)
    })
  }

  static searchOnlineMod(query) {
    this.onlineQuery = query
    this.clearOnlineModList()
  }

  static changeOnlineModsSort(order) {
    this.onlineSort = order
    this.clearOnlineModList()
  }

  static searchInstalledMod(query) {
    this.installedQuery = query
    this.updateInstalledModsTable()
  }

  static clearOnlineModList() {
    this.lastPage = 0
    this.fetchingMods = true
    this.mods.forEach(mod => {
      mod.inList = false
    })
    this.loadPage(this.onlineSort, this.onlineQuery).then(() => {
      $('.onlineModsTable').parent().off('scroll')
      $('.onlineModsTable').parent().on('scroll', function() {
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 600) {
          if (!ModManager.fetchingMods) {
            ModManager.fetchingMods = true
            ModManager.loadPage(ModManager.onlineSort, ModManager.onlineQuery)
          }
        }
      })
    }).catch((err) => {
      Tasks.getInstance().showError("Error! " + err)
      console.error(err)
    })
  }

  static isCheckingForUpdates() {
    return this.checkingForUpdates
  }

  static isFetchingMods() {
    return this.fetchingMods
  }

  static getPageCount() {
    return api.searchMods({page_size: 25}).then((body) => {
      this.page_count = body.pagination.page_count
    })
  }

  static loadPage(order = 'top', query = '') {
    this.lastPage++
    let id = Tasks.getInstance().addTask("Loading Mods")
    return api.searchMods({page_size: 25, page: this.lastPage, order: order, q: query}).then((body) => {
      this.page_count = body.pagination.page_count
      body.results = body.results.forEach(result => {
        let mod = this.mods.indexOf(this.mods.find(x => x.name == result.name))
        result.inList = true
        if (mod !== -1) {
          this.mods[mod] = objectJoin(this.mods[mod], result)
        } else {
          this.mods.push(result)
        }
      })

      Tasks.getInstance().finishTask(id)
      this.fetchingMods = false
      this.updateInstalledModsTable()
      this.updateOnlineModsTable()
    })
  }

  static checkUpdates() {
    let id = Tasks.getInstance().addTask("Checking for Updates")
    api.checkUpdates(this.mods.filter(x => x.version != null).map(mod => {return {name: mod.name, version: mod.version}})).then((list) => {
      Tasks.getInstance().finishTask(id)
      this.mods = this.mods.map((item) => {
        item = objectJoin(item, list.find(x => x.name == item.name))
        item.latest_release = list.find(x => x.name == item.name).releases[0]
        item.hasUpdate = list.find(x => x.name == item.name).hasUpdate
        return item
      })
      this.checkingForUpdates = false
      this.updateInstalledModsTable()
      this.updateOnlineModsTable()
    }).catch((err) => {
      Tasks.getInstance().showError("Error! " + err)
      console.error(err)
    })
  }

  static checkUpdate(mod) {
    let id = Tasks.getInstance().addTask("Checking for Updates")
    api.checkUpdate(mod).then((mod) => {
      Tasks.getInstance().finishTask(id)
      this.mods = this.mods.map((item) => {
        if (item.name == mod.name) {
          item = objectJoin(item, mod)
          item.latest_release = mod.releases[0]
        }
        return item
      })
      this.checkingForUpdates = false
      this.updateInstalledModsTable()
      this.updateOnlineModsTable()
    }).catch((err) => {
      Tasks.getInstance().showError("Error! " + err)
      console.error(err)
    })
  }

  static updateMod(mod) {
    let id = Tasks.getInstance().addTask(`Updating mod: ${mod.name}`)
    api.updateMod(mod).then((onlineMod) => {
      this.mods = this.mods.map((x) => {
        if (x.name == onlineMod.name) {
          x.version = onlineMod.releases[0].version
          x.hasUpdate = false
        }
        return x
      })

      this.saveModList()
      Tasks.getInstance().finishTask(id)
      this.updateOnlineModsTable()
    }).catch((err) => {
      Tasks.getInstance().showError("Error! " + err)
      console.error(err)
    })
  }

  static downloadMod(mod) {
    let id = Tasks.getInstance().addTask(`Downloading mod: ${mod.name}`)
    api.downloadMod(mod).then((onlineMod) => {
      let installedVersion = mod.version ? mod.version : onlineMod.releases[0].version

      this.mods = this.mods.map((x) => {
        if (x.name == onlineMod.name) {
          x.version = installedVersion
        }
        return x
      })

      let newMod

      if (!this.mods.find(x => x.name == onlineMod.name)) {
        newMod = {
          local: {
            enabled: true,
            name: onlineMod.name,
            version: installedVersion
          },
          online: {
            full: onlineMod,
            latest_release: onlineMod.releases[0]
          }
        }
        this.mods.push(newMod)
        this.mods = this.mods.sort(compare)
      } else {
        newMod = this.mods.find(x => x.name == onlineMod.name)
      }

      this.checkUpdate({name: newMod.name, version: newMod.version})

      this.saveModList()
      Tasks.getInstance().finishTask(id)
      this.updateOnlineModsTable()
    }).catch((err) => {
      Tasks.getInstance().showError("Error! " + err)
      console.error(err)
    })
  }

  static updateInstalledModsTable() {
    let list = this.mods.filter(x => (
      x.version != null
    ))
    list = list.filter(x => (
      x.name.toLowerCase().includes(this.installedQuery) ||
      x.title.toLowerCase().includes(this.installedQuery)
    ))
    InstalledMods.getInstance().setTable(list)
  }

  static updateOnlineModsTable() {
    let list = this.mods.filter(x => x.inList == true)
    let sorter
    switch (this.onlineSort) {
      case 'top':
        sorter = (a, b) => b.downloads_count - a.downloads_count
        break
      case 'alpha':
        sorter = (a, b) => {
          var nameA = a.name.toUpperCase()
          var nameB = b.name.toUpperCase()
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        }
        break
      case 'updated':
        sorter = (a, b) => (a.updated_at > b.updated_at) ? -1 : ((a.online.updated_at < b.online.updated_at) ? 1 : 0)
        break
      default:
        sorter = (a, b) => b.downloads_count - a.downloads_count
    }
    list = list.sort(sorter)
    OnlineMods.getInstance().setTable(list)
  }

  static changeTable(table) {
    this.mods = this.mods.map((mod, index) => {
      if (table.find(x => x.name == mod.name)) {
        mod.enabled = table.find(x => x.name == mod.name).enabled
      }
      return mod
    })
    this.saveModList()
  }

  static saveModList() {
    api.saveModList(
      this.mods
      .filter(x => (
        x.enabled != null
      ))
      .map(x => {
        return {
          name: x.name,
          enabled: x.enabled
        }
      })
    ).then(() => {
      this.updateInstalledModsTable()
    })
  }

  static requestUpdate() {
    this.loadInstalledMods()
  }
}

function compare(a, b) {
  a = a.name.toLowerCase()
  b = b.name.toLowerCase()
  if (a < b)
    return -1;
  if (a > b)
    return 1;
  return 0;
}
