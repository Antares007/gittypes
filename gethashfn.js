module.exports = function (hashFn) {
  return function (repo) {
    var map = repo._cache
    if (map.has(this)) {
      return map.get(this)
    }
    var rez = hashFn(repo).then((hash) => {
      if (!hash) console.log(this, hashFn.toString())
      this.hash = hash
      return hash
    })
    map.set(this, rez)
    return rez
  }
}
