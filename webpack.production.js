const { merge } = require('webpack-merge');
// const { DefinePlugin } = require('webpack');
const base = require('./webpack.base');

const productionConfig = {
  mode: 'production',
  devtool: 'source-map',
  devServer: {
    open: false,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  performance: {
    hints: 'error',
  },
};

module.exports = merge(base, productionConfig);
