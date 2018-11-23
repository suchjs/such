const path = require('path');

module.exports = {
  entry: './src/browser.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules|__tests__|lib|dist/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    filename: 'such.min.js',
    path: path.resolve(__dirname, 'dist')
  }
};