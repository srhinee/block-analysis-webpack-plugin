const path = require ('path')
const plugin = require ('../../lib')
module.exports = {
  entry:path.join (__dirname, 'index.js'),
  output: {
    filename: 'js/bundle.js',
    path: path.resolve (__dirname, 'dist')
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [new plugin ()]
}