const path = require ("path")
const webpackPlugin = require ("../../lib/webpack4Plugin.js")

module.exports = {
  entry: path.resolve (__dirname, "index.js"),
  output: {
    path: path.resolve (__dirname, "dist")
  },
  optimization: {
    concatenateModules: true
  },
  // mode: "production",
  mode: "development",
  plugins: [new webpackPlugin ()]
}
