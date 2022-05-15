const webpack = require ("webpack")
const options = require ("./webpack.config.js")
const compiler = webpack (options)

compiler.run ((err, stats) => {
  if (err) console.log (err)
})


