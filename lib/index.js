const plugin = require ('./webpackModuleGraphPlugin.js')

// todo version

// node service
const express = require('express')
const path = require('path')
const app = express()
const port = 8088
app.use(express.static(path.join(__dirname)))
app.listen(port, function () {
  console.log(`Server start on: http://127.0.0.1:${port}`)
})

module.exports = plugin