const { merge } = require("webpack-merge");
const base = require("./webpack.base");

const devConfig = {
  mode: "development",
  devtool: "inline-source-map"
};
const resultConfig = merge(base, devConfig);

// Add cors header
resultConfig.devServer.headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*"
}

module.exports = resultConfig;
