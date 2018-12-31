Orbi-Pro Implementation Documentation
=====================================
Last updated 12/29/2018.

Dependencies
------------
External dependencies:
- [request|https://github.com/request/request] provides simplified semantics for http requests.
- [request-promise|https://github.com/request/request-promise-native] adds promise semantics to request.
- [chai|https://chaijs.org/] provides helpful unit testing assertions.
- [mocha|https://mochajs.org/] is used to run tests.
- [babel|https://babeljs.io] is used to transpile ES6 to JS (because mocha doesn't support es6 out of the box).

Testing
-------
Tests are contained in ./test directory.

[Mocha|https://mochajs.org/] is used to run tests. We're using babel (7) with mocha in order to transpile test ES6 files to js.

Test also use chai for assertion functions.

Useful links:
- https://github.com/mochajs/mocha/wiki/compilers-deprecation
  (explains why we're using --require instead of --compilers)
- https://babeljs.io/setup#installation
- https://www.chaijs.com/guide/installation/#configuration


