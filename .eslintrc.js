/**
 * These rules enforce the Hack Reactor Style Guide
 *
 * Visit this repo for more information:
 *   https://github.com/reactorcore/eslint-config-hackreactor
 */

module.exports = {
  "extends": "airbnb",
  "env": {
    "mocha": "true",
    "browser": "true"
  },
  "plugins": [
    "mocha"
  ],
  "rules": {
    "mocha/no-mocha-arrows": "error",
    "mocha/no-return-and-callback": "error",
    "mocha/handle-done-callback": "error",
    "mocha/no-exclusive-tests": "error",
    "mocha/no-identical-title": "error",
    "import/extensions": "off"
  },
}
