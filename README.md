# babel-plugin-sitrep

> Log all assignments and the return value of a function with a simple comment

[![npm version](https://badge.fury.io/js/babel-plugin-sitrep.svg)](https://badge.fury.io/js/babel-plugin-sitrep)
[![Build Status](https://travis-ci.org/tkh44/babel-plugin-sitrep.svg?branch=master)](https://travis-ci.org/tkh44/babel-plugin-sitrep)
[![codecov](https://codecov.io/gh/tkh44/babel-plugin-sitrep/branch/master/graph/badge.svg)](https://codecov.io/gh/tkh44/babel-plugin-sitrep)

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

// sitrep prefix
function bar () {
  var a = 'foo'
  return a
}

```

`↓ ↓ ↓ ↓ ↓ ↓`

**Out**

```javascript
// sitrep
function bar () {
  console.groupCollapsed('bar');

  var a = 'foo';
  console.log('a: ', a);
  const b = 'bar';
  console.log('b: ', b);
  let c = [a, b].map(x => x);
  console.log('c: ', c);

  var _returnValue = c.join('-');

  console.log('Return Value:', _returnValue);
  console.groupEnd('bar');
  return _returnValue;
}

// sitrep
var cb = function (x) {
  console.groupCollapsed('cb');

  var _returnValue3 = x.charAt(0);

  console.log('Return Value:', _returnValue3);
  console.groupEnd('cb');
  return _returnValue3;
};

// sitrep
var cb = function (x) {
  console.groupCollapsed('cb');

  x = x + 2;
  console.log('x: ', x);
  x.charAt(0);
  var _returnValue4 = x;
  console.log('Return Value:', _returnValue4);
  console.groupEnd('cb');
  return _returnValue4;
};

// sitrep
var a = function () {
  console.groupCollapsed('a');
  var _returnValue5 = 'foo';
  console.log('Return Value:', _returnValue5);
  console.groupEnd('a');

  return _returnValue5;
};

const obj = {
  // sitrep
  fn() {
    console.groupCollapsed('fn');

    let a = 5;
    console.log('a: ', a);

    var _returnValue6 = a + 5;

    console.log('Return Value:', _returnValue6);
    console.groupEnd('fn');
    return _returnValue6;
  }
};

class Boom {
  // sitrep
  fire() {
    console.groupCollapsed('fire');

    let a = 2;
    console.log('a: ', a);

    var _returnValue7 = a + 5;

    console.log('Return Value:', _returnValue7);
    console.groupEnd('fire');
    return _returnValue7;
  }
}

// sitrep prefix
function bar () {
  console.groupCollapsed('(prefix) bar');

  var a = 'foo';
  console.log('a: ', a);

  var _returnValue8 = c.join('-');

  console.log('Return Value:', _returnValue8);
  console.groupEnd('(prefix) bar');
  return _returnValue8;
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


## Options

### `label`

`string`, defaults to `sitrep`.

This option changes the label that enables the plugin

**Example**

If we set `label` to `"log-all-the-things"`

**In**
```javascript
// log-all-the-things
function fn(a) {
  a = a.map(x => x)
  return a
}
```

```↓ ↓ ↓ ↓ ↓ ↓```

**Out**
```javascript
// log-all-the-things
function fn(a) {
  console.groupCollapsed("fn");

  a = a.map(x => x);
  console.log("a: ", a);
  var _returnValue = a;
  console.log("Return Value:", _returnValue);
  console.groupEnd("fn");
  return _returnValue;
}
```

### `collapsed`

`boolean`, defaults to `true`.

This option enables the following:

 - Collapse the group of console logs associated with a function
