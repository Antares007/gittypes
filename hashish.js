'use strict'
class Hashish {
  constructor (hashFn) {
    if (typeof hashFn !== 'function') throw new Error('argument error')
    var self = this
    this.getHash = function (repo) {
      var map = repo._cache
      if (map.has(self)) {
        return map.get(self)
      }
      var rez = hashFn(repo).then(function (hash) {
        self.hash = hash
        return hash
      })
      map.set(self, rez)
      return rez
    }
  }

  bind (Type, fn) {
    return new Type((repo) => this.valueOf(repo).then(function (value) {
      var rez = fn(value)
      if (rez instanceof Hashish) {
        if (rez instanceof Type) {
          return rez.getHash(repo)
        } else {
          throw new Error(`cant bind ${rez.constructor.name} to ${Type.name}`)
        }
      } else {
        return Type.of(rez).getHash(repo)
      }
    }))
  }

  valueOf (repo) {
    return this.getHash(repo).then((hash) => repo.valueOf(hash))
  }

  castTo (Type) {
    var rez = new Type((repo) => this.getHash(repo))
    if (this.hash) rez.hash = this.hash
    return rez
  }

  static of (buffer) {
    return new Hashish((repo) => repo.hash(buffer))
  }

  static get (Type, api, hash) {
    return new Type(() => Promise.resolve(hash))
    return new Type(function (api_) {
      if (api === api_) {
        return Promise.resolve(hash)
      } else {
        return api_.has(hash).then(function (hashHash) {
          if (hashHash) {
            return hash
          } else {
            return new Type(() => Promise.resolve(hash))
              .valueOf(api)
              .then((value) => Type.of(value).getHash(api_))
          }
        })
      }
    })
  }
}
module.exports = Hashish
