var path = require('path')

module.exports = {
  entry: './js/game.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'game.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    compress: true,
    port: 8080
  }
}
