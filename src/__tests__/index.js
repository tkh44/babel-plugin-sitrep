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
      title: 'function',
      code: `
        // sitrep
        function bar () {
          var a = 'foo'
          const b = 'bar'
          let c = [a, b].map(x => x)
          return c.join('-')
        }
      `
    },
    {
      title: 'arrow function expression (shorthand arrow fn)',
      code: `
        // sitrep
        var cb = x => x.charAt(0)
      `
    },
    {
      title: 'arrow function assignment',
      code: `
        // sitrep
        var cb = x => {
          x = x + 2
          x.charAt(0)
          return x
        }
      `
    },
    {
      title: 'function assignment',
      code: `
        // sitrep
        var a = function () {
          return 'foo'
        }
      `
    },
    {
      title: 'object properties',
      code: `
        const obj = {
          // sitrep
          fn() {
            const { a, b, c = 'foo', d: alias } = x;
            return a + b + c + alias;
          }
        }
      `
    },
    {
      title: 'class methods',
      code: `
        class Boom {
          // sitrep
          fire() {
            let a = 2
            
            return a + 5
          }
        }
      `
    },
    {
      title: 'no function parent',
      code: `
        // sitrep
        if (a) {
          let a = 2
          
          let b = a + 5
        }
      `
    },
    {
      title: 'arrow fn expression callback',
      code: `
        myFn(
          // sitrep
          (x) => x
        )
      `
    },
    {
      title: 'function declaration with multiple returns',
      code: `
        myFn(
          // sitrep
          function(err, vars) {
            if (err) {
              return err
            }
            
            vars = vars.map(x => x)
            return vars
          }
        )
      `
    }
  ]
})
