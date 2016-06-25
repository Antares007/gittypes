'use strict'
const wrapHashFn = require('./gethashfn')

class Hashish {
  constructor (hashFn) {
    if (typeof hashFn !== 'function') throw new Error('argument error')
    this.getHash = wrapHashFn(hashFn)
  }

  bind (Type, fn) {
    return Hashish.bindAll(Type, [this], function (values) { return fn.apply(this, values) })
  }

  static bindAll (Type, args, fn) {
    return new Type((repo) => Promise.all(args.map((o) => o.valueOf(repo))).then(function (values) {
      var rez = fn(values)
      if (!rez) throw new Error('function not returns rez ' + fn.toString())
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
    return new Type((api) => Promise.resolve(hash))
    // return new Type(function (api_) {
    //   if (api === api_) {
    //     return Promise.resolve(hash)
    //   } else {
    //     return api_.has(hash).then(function (hashHash) {
    //       if (hashHash) {
    //         return hash
    //       } else {
    //         return new Type(() => Promise.resolve(hash))
    //           .valueOf(api)
    //           .then((value) => Type.of(value).getHash(api_))
    //       }
    //     })
    //   }
    // })
  }
}
module.exports = Hashish
