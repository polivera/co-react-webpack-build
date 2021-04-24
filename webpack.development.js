const { merge } = require('webpack-merge');
const base = require('./webpack.base');

const devConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
};

module.exports = merge(base, devConfig);
