# babel-plugin-sitrep

> Log all assignments and the return value of a function with a simple comment

## Example

**In**

```javascript
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

```

`↓ ↓ ↓ ↓ ↓ ↓`

**Out**

```javascript
// sitrep
function bar () {
  console.log("function: bar ") ;
  var a = 'foo';
  console.log('a', a);
  const b = 'bar';
  console.log('b', b);
  let c = [a, b].map(function (x) {
    var _returnValue2 = x;
    console.log('Return Value:', _returnValue2);
    return _returnValue2;
  });
  console.log('c', c);
  var _returnValue = c.join('-');
  console.log('Return Value:', _returnValue);
  return _returnValue;
}

// sitrep
var cb = function (x) {
  var _returnValue3 = x.charAt(0);

  console.log('Return Value:', _returnValue3);
  return _returnValue3;
};

// sitrep
var cb = function (x) {
  x = x + 2;
  console.log('x', x);
  x.charAt(0);
  var _returnValue4 = x;
  console.log('Return Value:', _returnValue4);
  return _returnValue4;
};

// sitrep
var a = function () {
  var _returnValue5 = 'foo';
  console.log('Return Value:', _returnValue5);

  return _returnValue5;
};

const obj = {
  // sitrep
  fn() {
    let a = 5;
    console.log('a', a);

    var _returnValue6 = a + 5;

    console.log('Return Value:', _returnValue6);
    return _returnValue6;
  }
};

class Boom {
  // sitrep
  fire() {
    let a = 2;

    console.log('a', a);

    var _returnValue7 = a + 5;

    console.log('Return Value:', _returnValue7);
    return _returnValue7;
  }
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
