const { merge } = require('webpack-merge');
const base = require('./webpack.base');

const productionConfig = {
  mode: "production",
  devtool: "none"
};

module.exports = merge(base, productionConfig);
