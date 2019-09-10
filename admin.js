const { createAdmin } = require('./index.js')

let a = false
let b = false
let c = false

module.exports = createAdmin({
  tasks: {
    A: {
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
    B: {
      dependencies: ['A'],
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
    C: {
      dependencies: ['B'],
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
