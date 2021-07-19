const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const version = require('./package.json').version;
module.exports = {
  entry: './src/browser.ts',
  mode: 'production',
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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: true,
          keep_classnames: false,
          keep_fnames: false,
        },
      }),
    ],
  },
};
