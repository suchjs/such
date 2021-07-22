const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const version = require('./package.json').version;
const resolve = (pathname) => path.resolve(__dirname, pathname);
const fileName = `such.${version}.min.js`;
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
    extensions: ['.ts'],
  },
  output: {
    filename() {
      return fileName;
    },
    path: resolve('dist'),
    globalObject: 'this',
    library: {
      name: 'Such',
      type: 'umd',
      export: 'default',
    },
  },
  plugins: [
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            {
              source: resolve(`dist/${fileName}`),
              destination: resolve('dist/such.min.js'),
            },
          ],
          delete: [resolve('lib')],
        },
      },
    }),
  ],
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
