'use strict'
class Hashish {
  constructor (hashFn) {
    if (typeof hashFn !== 'function') throw new Error('argument error')
    this.getHash = (repo) => hashFn(repo).then((hash) => (this.hash = hash, hash))
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
    return new Type((repo) => this.getHash(repo))
  }

  static of (buffer) {
    return new Hashish((repo) => repo.hash(buffer))
  }

  static get (Type, api, hash) {
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
