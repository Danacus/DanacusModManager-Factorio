
import InstalledMods from '../Components/Pages/InstalledMods/InstalledMods'
import OnlineMods from '../Components/Pages/OnlineMods/OnlineMods'
import api from '../api/node-factorio-api'
import Tasks from '../Components/Tasks';
import Dialog from '../Components/Dialog';
import $ from 'jquery'
import semver from 'semver'
import objectJoin from 'object-join'
import {Filters, Sorters} from './utils/listUtils'

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
          result.hasUpdate = false
          this.mods.push(result)
        }
      })

      Tasks.getInstance().finishTask(id)
      this.fetchingMods = false
      this.updateInstalledModsTable()
      this.updateOnlineModsTable()
    })
  }

  static checkUpdates(mods = this.mods.filter(x => x.version != null)) {
    let id = Tasks.getInstance().addTask("Checking for Updates")
    api.checkUpdates(mods).then((list) => {
      Tasks.getInstance().finishTask(id)
      this.mods = this.mods.map((item) => {
        if (list.find(x => x.name == item.name)) {
          console.log(list.find(x => x.name == item.name).hasUpdate);
          item = objectJoin(item, list.find(x => x.name == item.name))
          item.latest_release = list.find(x => x.name == item.name).releases[0]
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

    // Download the mod
    api.downloadMod(mod).then((onlineMod) => {
      this.addDownloadedMod(onlineMod, mod.version)
      this.checkUpdate(mod)
      Tasks.getInstance().finishTask(id)
      api.getDependencies(mod).then((mods) => {
        if (mods.length > 0) {
          Dialog.getInstance().showDialog(
            `Download dependencies for ${mod.name}?`,
            `Dependencies: \n ${mods.map(mod => '- ' + mod.name).join('\n')}`,
            ['No', 'Yes']
          ).then(action => {
            if (action == 'Yes') {
              this.downloadDependencies(mod)
            }
          })
        }
      })
    }).catch((err) => {
      Tasks.getInstance().showError("Error! " + err)
      console.error(err)
    })
  }

  static downloadDependencies(mod) {
    let id = Tasks.getInstance().addTask(`Downloading dependencies for: ${mod.name}`)
    let dependencies
    let downloadedMods = []

    // Load all its dependencies
    api.getDependencies(mod).then((mods) => {
      dependencies = mods
      // Get installed mods
      let installedMods = this.mods.filter(x => x.version != null)
      let updates = []

      // Update installed dependencies (will not update if up-to-date)
      installedMods.forEach(installedMod => {
        let dependency = dependencies.find(mod => mod.name == installedMod.name)
        if (dependency) {
          updates.push(installedMod)

          // Remove them from dependencies
          dependencies = dependencies.splice(dependencies.indexOf(dependency), 1)
        }
      })
      return api.updateMods(updates)
    }).then((updatedMods) => {
      this.checkUpdates(updatedMods.map(updatedMod => {
        updatedMod.version = updatedMod.releases[0].version
        return updatedMod
      }))
      downloadedMods = downloadedMods.concat(updatedMods)

      // Download remaining dependencies
      return api.downloadMods(dependencies)
    }).then((downloadedDependencies) => {
      downloadedMods = downloadedMods.concat(downloadedDependencies)

      // Update the mod list
      downloadedMods.forEach(downloadedMod => {
        this.addDownloadedMod(downloadedMod)
      })

      // Sort the mod list
      this.mods = this.mods.sort(compare)

      // Save the mod list
      this.saveModList()
      Tasks.getInstance().finishTask(id)

      // Update the tables
      this.updateInstalledModsTable()
      this.updateOnlineModsTable()
    }).catch(err => {
      Tasks.getInstance().showError("Error! " + err)
      console.error(err)
    })
  }

  static addDownloadedMod(onlineMod, installedVersion = onlineMod.releases[0].version) {
    this.mods = this.mods.map((x) => {
      if (x.name == onlineMod.name) {
        if (x.enabled == null) {
          x.enabled = true
        }
        x.version = installedVersion
      }
      return x
    })
  }

  static updateInstalledModsTable() {
    let list = this.mods.filter(Filters.installed)
    list = Filters.search(list, this.installedQuery)
    InstalledMods.getInstance().setTable(list)
  }

  static updateOnlineModsTable() {
    let list = this.mods.filter(Filters.online)
    let sorter
    switch (this.onlineSort) {
      case 'top':
        sorter = Sorters.downloads
        break
      case 'alpha':
        sorter = Sorters.alphabetically
        break
      case 'updated':
        sorter = Sorters.updated
        break
      default:
        sorter = Sorters.updated
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
    api.saveModList(Filters.toModList(this.mods)).then(() => {
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
