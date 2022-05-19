var path = require ("path")
var webpack = require ("webpack")
const plugin=require('../../lib')
module.exports = {
  mode: "development" || "production",
  entry: './example.js',
  output: {
    path: path.join (__dirname, "dist"),
  },
  plugins: [
    new webpack.DllReferencePlugin ({
      context: path.join (__dirname, "..", "dll"),
      manifest: require ("../dll/dist/alpha-manifest.json") // eslint-disable-line
    }),
    new webpack.DllReferencePlugin ({
      scope: "beta",
      manifest: require ("../dll/dist/beta-manifest.json"), // eslint-disable-line
      extensions: [".js", ".jsx"]
    }),
    new plugin()
  ]
}
