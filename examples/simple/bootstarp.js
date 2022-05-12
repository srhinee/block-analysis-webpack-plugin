const webpack = require ("webpack")
const options = require ("./webpack.config.js")
const fs = require ("fs")
const compiler = webpack (options)

compiler.run ((err, stats) => {
  fs.writeFile ('dist/stat.json', JSON.stringify (stats.toJson ()), function (err) {
    console.error (err)
  })
  stats.toString ({
    colors: true // 在控制台展示颜色
  })
})
