const path = require('path');
const version = require('./package.json').version;
module.exports = {
  entry: './src/browser.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules|__tests__|lib|dist|local|coverage/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: () => {
      return `such.${version}.min.js`;
    },
    path: path.resolve(__dirname, 'dist'),
  },
};
