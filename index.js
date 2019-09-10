const express = require('express')
const path = require('path')
const util = require('./util')
const R = require('ramda')
const WebSocket = require('ws')
const EventEmitter = require('events')

module.exports = function createAdmin(config) {
  if (!config.path) config.path = '/admin'

  const emitter = new EventEmitter()

  const taskList = Object.keys(config.tasks || {})
  const taskStates = {}
  taskList.forEach(key => {
    taskStates[key] = 'unverified'
  })

  async function install(task) {
    await config.tasks[task].install()
    await verify(task)
  }
  async function uninstall(task) {
    await config.tasks[task].uninstall()
    await verify(task)
  }
  async function verify(task) {
    const verified = await config.tasks[task].verify()
    const nextState = verified ? 'verified' : 'invalid'
    taskStates[task] = nextState
    emitter.emit('change')
  }
  const commands = {
    install,
    uninstall,
    verify,
  }
  const verifyAll = () => {
    taskList.forEach(commands.verify)
  }

  verifyAll()

  const administrate = app => {
    const wss = new WebSocket.Server({ port: 4938 })
    wss.on('connection', ws => {
      ws.on('message', e => {
        console.log('message:', e)
        const [command, ...args] = JSON.parse(e)
        commands[command](...args)
      })
      console.log('connection')
      const sendState = () =>
        ws.send(JSON.stringify(['set', ['taskStates'], taskStates]))
      sendState()
      emitter.on('change', () => {
        console.log('change detected')
        sendState()
      })
      ws.send(JSON.stringify(['log', 'hello from your admin']))
    })

    // Send html for admin page
    app.get(config.path, (req, res) => {
      res.send(template(config.path))
      res.end()
    })

    // host files and modules
    app.use(config.path, express.static('./static'))
    app.use(config.path, express.static('./node_modules/'))
  }

  return {
    administrate,
  }
}

// voidTag does nothing except give a hint for syntax highlighting
const html = util.voidTag
const template = path => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="content-type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <script type="text/javascript" src="${path}/react.js"></script>
      <script type="text/javascript" src="${path}/react-dom.js"></script>
      <script type="text/javascript" src="${path}/mui.js"></script>
      <title>Repo Admin</title>
    </head>
    <body data-admin="4938">
      <div id="app"></div>

      <script src="${path}/mount.js" type="module" defer></script>
    </body>
  </html>
`
