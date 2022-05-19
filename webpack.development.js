const { merge } = require('webpack-merge');
const { resolve } = require('path');
const path = require('path');
const baseConfig = require('./webpack.base');

const processPath = process.cwd();

/**
 * Extract all the information from the package.json file
 */
const {
  host = 'localhost',
  port = 9000,
  allowedHosts = 'auto'
// eslint-disable-next-line import/no-dynamic-require
} = require(resolve(processPath, 'package.json'));
const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.resolve(processPath, 'dist')
    },
    host,
    port,
    open: true,
    hot: true,
    compress: true,
    allowedHosts
  }
};
const resultConfig = merge(baseConfig, devConfig);

module.exports = resultConfig;
