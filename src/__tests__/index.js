const pluginTester = require('babel-plugin-tester')
const plugin = require('../index')

pluginTester({
  plugin: plugin,
  pluginName: 'sitrep',
  snapshot: true,
  tests: [
    {
      title: 'should not add console logs',
      code: `
        function bar () {
          var a = 'foo'
          const b = 'bar'
          let c = [a, b].map(x => x.charAt(0))
          console.log('h')
          return c.join('-')
        }
      `
    },
    {
      title: 'should add console logs',
      code: `
        // sitrep
        function bar () {
          var a = 'foo'
          const b = 'bar'
          let c = [a, b].map(x => x.charAt(0))
          console.log('h')
          return c.join('-')
        }
      `
    }
  ]
})
