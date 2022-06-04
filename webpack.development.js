const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');

/**
 * Extract all the information from the package.json file
 */
const devConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
};
const resultConfig = merge(baseConfig, devConfig);

module.exports = resultConfig;
