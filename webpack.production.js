const { merge } = require('webpack-merge');
const base = require('./webpack.base');

const productionConfig = {
  mode: "production",
};

module.exports = merge(base, productionConfig);
