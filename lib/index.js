const open = require ('open')
const express = require ('express')
const path = require ('path')
const webpack = require ('webpack')
const net = require ('net')
const port = 8085

let createPlugin = null
if (webpack.version && webpack.version[0] > 4) {
  // webpack5 and upper
  createPlugin = require ('./webpack5Plugin.js')
} else {
  // webpack4 and lower
  createPlugin = require ('./webpack4Plugin.js')
}

// node service
function portIsOccupied (port, callback) {
  let server = net.createServer ().listen (port)

  server.on ('listening', function () {
    server.close ()
    callback ()
  })

  server.on ('error', function (err) {
    if (err.code === 'EADDRINUSE') {
      console.log ('The port【' + port + '】 is occupied, please change other port.')
    }
  })
}

const startServer = () => portIsOccupied (port, () => {
  const app = express ()
  app.use (express.static (path.join (__dirname, '../graph')))
  app.listen (port, 'localhost', async function () {
    console.log (`Server start on: http://localhost:${port}`)
    await open (`http://localhost:${port}`)
  })
})


const argv = require ('minimist') (process.argv.slice (2))
if (argv.open) startServer ()


module.exports = createPlugin (startServer)