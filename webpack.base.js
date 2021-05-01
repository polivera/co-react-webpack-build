const { _resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

const processPath = process.cwd();

const SRC_PATH = _resolve(processPath, 'src');
const DIST_PATH = _resolve(processPath, 'dist');
const PKG_JSON_FILE = _resolve(processPath, 'package.json');
const PUBLIC_PATH = _resolve(SRC_PATH, 'public');

const {
  name: packageName,
  main: entryFileName,
  fonts: fontConfig,
  port = 9000,
  shared,
  remotes,
  exposes,
// eslint-disable-next-line import/no-dynamic-require
} = require(PKG_JSON_FILE);
const ENTRY_FILE_PATH = _resolve(SRC_PATH, entryFileName);

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

const rules = {
  css: {
    test: /\.css$/i,
    use: ['style-loader', 'css-loader'],
  },
  jsx: {
    test: /\.jsx?$/,
    include: [SRC_PATH],
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
  },
  fonts: {
    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'file-loader',
    include: fontConfig?.include || _resolve(PUBLIC_PATH, 'fonts'),
    options: {
      name: '[name].[ext]',
      outputPath: fontConfig?.outputPath || _resolve(PUBLIC_PATH, 'fonts'),
    },
  },
};

const webpackConfig = {
  context: SRC_PATH,
  entry: ENTRY_FILE_PATH,
  devServer: {
    port,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  output: {
    path: DIST_PATH,
    filename: entryFileName,
  },
  module: {
    rules: [
      rules.css,
      rules.jsx,
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(
      { template: _resolve(PUBLIC_PATH, 'index.html') },
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

if (fontConfig) {
  webpackConfig.module.rules = [...webpackConfig.module.rules, rules.fonts];
}

module.exports = webpackConfig;
