const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

const processPath = process.cwd();

const SRC_PATH = path.resolve(processPath, 'src');
const DIST_PATH = path.resolve(processPath, 'dist');
const PKG_JSON_FILE = path.resolve(processPath, 'package.json');

const {
  name: packageName,
  main: entryFileName,
  environment = 'development',
  shared,
  remotes,
  exposes,
// eslint-disable-next-line import/no-dynamic-require
} = require(PKG_JSON_FILE);
const ENTRY_FILE_PATH = path.resolve(SRC_PATH, entryFileName);

/**
 * Camelize given string
 * @returns string
 * @param str string
 */
const camelize = (str) => (
  str.replace(/(?:^\w|[A-Z]|-|\b\w|\s+)/g, (match, index) => {
    if (match === ' ' || match === '-') return '';
    return (index === 0) ? match.toLowerCase() : match.toUpperCase();
  })
);
const PACKAGE_NAME = camelize(packageName);

module.exports = {
  context: SRC_PATH,
  entry: ENTRY_FILE_PATH,
  mode: environment,
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  output: {
    path: DIST_PATH,
    filename: entryFileName,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        include: [SRC_PATH],
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'public/fonts/',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(
      { template: path.resolve(SRC_PATH, 'index.html') },
    ),
    new ModuleFederationPlugin({
      name: PACKAGE_NAME,
      library: { type: 'var', name: PACKAGE_NAME },
      filename: 'remoteEntry.js',
      exposes,
      shared,
      remotes,
    }),
  ],
};
