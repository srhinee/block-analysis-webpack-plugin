const webpack = require ("webpack")
const options = require ("./webpack.config.js")
const fs = require ("fs")

const compiler = webpack (options)

compiler.run ((err, stats) => {
  if (err) console.log (err)
  fs.writeFile ('dist/stat.json', JSON.stringify (stats.toJson ()), function (err) {
    console.log (err)
  })
  stats.toString ({
    colors: true
  })
})
