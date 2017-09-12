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
          let c = [a, b].map(x => x)
          return c.join('-')
        }
        
        var cb = x => x.charAt(0)
        
        var cb = x => {
          x = x + 2
          x.charAt(0)
          return x
        }
        
        var a = function () {
          return 'foo'
        }
        
        const obj = {
          fn() {
            let a = 5
            return a + 5
          }
        }
        
        class Boom {
          fire() {
            let a = 2
            
            return a + 5
          }
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
          let c = [a, b].map(x => x)
          return c.join('-')
        }
        
        // sitrep
        var cb = x => x.charAt(0)
        
        // sitrep
        var cb = x => {
          x = x + 2
          x.charAt(0)
          return x
        }
        
        // sitrep
        var a = function () {
          return 'foo'
        }
        
        const obj = {
          // sitrep
          fn() {
            let a = 5
            return a + 5
          }
        }
        
        class Boom {
          // sitrep
          fire() {
            let a = 2
            
            return a + 5
          }
        }
      `
    }
  ]
})
