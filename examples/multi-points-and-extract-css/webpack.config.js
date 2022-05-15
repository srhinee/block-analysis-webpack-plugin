const path = require ("path")
const webpackPlugin = require ("../../lib")
const MiniCssExtractPlugin = require ("mini-css-extract-plugin")

module.exports = {
  entry: {
    css: path.resolve (__dirname, './a.css'),
    entryA: [path.resolve (__dirname, "index.js"),
      path.resolve (__dirname, "a.js")],
    entryB: [path.resolve (__dirname, "index.js"),
      path.resolve (__dirname, "b.js")]
  },
  output: {
    path: path.resolve (__dirname, "dist")
  },
  mode: "development",
  module: {
    rules: [
      {test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"]}
    ]
  },
  plugins: [new MiniCssExtractPlugin (), new webpackPlugin ()]
}
