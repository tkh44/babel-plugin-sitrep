# babel-plugin-sitrep

> Log all assignments and the return value of a function with a simple comment

## Example

**In**

```javascript
// sitrep
function bar () {
  var a = 'foo'
  const b = 'bar'
  let c = [a, b].map(x => x.charAt(0))
  return c.join('-')
}
```

**Out**

```javascript
// sitrep
function bar () {
  console.log("function: bar");
  var a = 'foo'
  console.log("a", a);
  const b = 'bar'
  console.log("b", b);
  let c = [a, b].map(x => x.charAt(0))
  console.log("c", c);
  var __$returnValue = c.join('-');
  console.log("Return Value:", __$returnValue);
  return __$returnValue;
}
```

## Installation

```sh
npm install --save-dev babel-plugin-sitrep
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

Without options:

```json
{
  "plugins": ["sitrep"]
}
```

### Via CLI

```sh
babel --plugins sitrep script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["sitrep"]
});
```
