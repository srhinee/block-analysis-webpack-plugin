const webpack = require ("webpack")
const options = require ("./webpack.config.js")
const fs = require ("fs")
const path = require ('path')

const compiler = webpack (options)

compiler.run ((err, stats) => {
  const data = JSON.stringify (stats.toJson ())
  fs.writeFile (path.join (__dirname, 'dist/stat.json'),data , function (err) {
    console.error (err)
  })
  stats.toString ({
    colors: true
  })
})
