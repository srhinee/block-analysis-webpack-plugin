var path = require ("path")
var webpack = require ("webpack")
var plugin = require ('../../lib')
module.exports = {
  mode: "development" || "production",
  resolve: {
    extensions: [".js", ".jsx"]
  },
  entry: {
    alpha: ["./alpha", "./a"],
    beta: ["./beta", "./b", "./c"]
  },
  output: {
    path: path.join (__dirname, "dist"),
    filename: "MyDll.[name].js",
    library: "[name]_[hash]"
  },
  plugins: [
    new webpack.DllPlugin ({
      path: path.join (__dirname, "dist", "[name]-manifest.json"),
      name: "[name]_[hash]"
    }),
    new plugin ()
  ]
}
