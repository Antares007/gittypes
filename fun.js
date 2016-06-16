const Package = require('./package')
const Tree = require('./tree')
const Blob = require('./blob')
const Seed = require('./seed')

class Fun extends Package {
  // call (...args) {
  //   return Seed.of()
  // }

  valueOf (api) {
    return super.valueOf(api).then(function (pack) {
      return pack.src.bind(Blob, function (t) {
        return t['index.js']
      }).valueOf(api).then(function (buffer) {
        var body = buffer.toString()
        var fnStr = body.slice(body.indexOf('\nmodule.exports = ') + 18)
        return {
          fnStr,
          dependencies: pack.dependencies
        }
      })
    })
  }

  static of (value) {
    var requires = Object.keys(value.dependencies)
      .map((name) => `const ${name} = require('${name}')`)
      .join('\n')
    var body = `${requires}${requires.length ? '\n' : ''}module.exports = ${value.fnStr}`
    return Package.of({
      name: 'anonymous',
      src: Tree.of({ 'index.js': Blob.of(Buffer.from(body)) }),
      main: 'index.js',
      dependencies: value.dependencies
    }).castTo(Fun)
  }

  static from (dependencies, fn) {
    return Fun.of({
      fnStr: fn.toString(),
      dependencies
    })
  }
}
module.exports = Fun
