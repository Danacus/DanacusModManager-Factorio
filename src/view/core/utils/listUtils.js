class Filters {
  static installed = x => x.version != null
  static online = x => x.inList
  static search = (array, query) => array.filter(x => (
    x.name.toLowerCase().includes(query.toLowerCase()) ||
    x.title.toLowerCase().includes(query.toLowerCase())
  ))
  static toModList = array => array
  .filter(x => (
    x.enabled != null
  ))
  .map(x => {
    return {
      name: x.name,
      enabled: x.enabled
    }
  })
}

class Sorters {
  static downloads = (a, b) => b.downloads_count - a.downloads_count
  static alphabetically = (a, b) => {
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
  static updated = (a, b) => {
    if (a.updated_at > b.updated_at) return -1
    else if (a.updated_at < b.updated_at) return 1
    else return 0
  }
}

export {Filters, Sorters}
