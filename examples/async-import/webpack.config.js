const path = require ("path")
const webpackPlugin = require ("../../lib")

module.exports = {
  entry: path.resolve (__dirname, "index.js"),
  output: {
    path: path.resolve (__dirname, "dist")
  },
  mode: "development",
  plugins: [new webpackPlugin()]
}
