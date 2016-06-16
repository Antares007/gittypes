'use strict'
var GitObject = require('./gitobject')

class Blob extends GitObject {
  valueOf (repo) {
    return super.valueOf(repo).then(function (go) {
      if (go.type !== 'blob') throw new Error('not a blob')
      return go.body
    })
  }

  static of (buffer) {
    return GitObject.of({ type: 'blob', body: buffer }).castTo(Blob)
  }

  static fromFunctionBody (fn) {
    var fnStr = fn.toString()
    return Blob.of(Buffer.from(fnStr.slice(fnStr.indexOf('{') + 1, fnStr.lastIndexOf('}'))))
  }
}
module.exports = Blob
