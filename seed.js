const Tree = require('./tree')
const Package = require('./package')

class Seed extends Tree {
  call (Type) {
    return new Type((api) => this.getHash(api).then((seedHash) => api.grow(seedHash)))
  }

  valueOf (api) {
    return super.valueOf(api).then(function (t) {
      return {
        args: t.args,
        fn: t.fn.castTo(Package)
      }
    })
  }

  static of (value) {
    return Tree.of({
      args: value.args,
      fn: value.fn
    }).castTo(Seed)
  }
}
module.exports = Seed

// var softSeed = Seed.of({
//   args: [ anvolCommit ]
//   fn: Package.of({
//     name: 'seed'
//     src: Tree.of({
//       'index.js': `
//       `
//     }),
//     dependencies: {
//       gittypes: gittypesPackage
//     }
//   })
// })

// softSeed.call(Commit, anvolCommit)
