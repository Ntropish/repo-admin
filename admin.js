const { createAdmin, unzip } = require('./index.js')

let a = false
let b = false
let c = false

module.exports = createAdmin({
  tasks: {
    a: {
      dependencies: [],
      verify() {
        return a
      },
      install() {
        a = true
      },
      uninstall() {
        a = false
      },
    },
    b: {
      dependencies: ['a'],
      verify() {
        return b
      },
      install() {
        b = true
      },
      uninstall() {
        b = false
      },
    },
    c: {
      dependencies: ['b'],
      verify() {
        return c
      },
      install() {
        c = true
      },
      uninstall() {
        c = false
      },
    },
  },
})
