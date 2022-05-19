const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

const processPath = process.cwd();
const PKG_JSON_FILE = resolve(processPath, "package.json");

/**
 * Extract all the information from the package.json file
 */
const {
  name: packageName,
  main: entryFileName = "index.ts",
  fonts: fontConfig,
  sourceFolder = "./src",
  host = "localhost",
  port = 9000,
  shared = [],
  remotes = [],
  exposes = [],
  dependencies: deps
// todo: is there a better way to do this?
// eslint-disable-next-line import/no-dynamic-require
} = require(PKG_JSON_FILE);

/**
 * Resolve paths and stuff
 */
const SRC_PATH = resolve(processPath, sourceFolder);
const ENTRY_FILE_PATH = resolve(SRC_PATH, entryFileName);
const PUBLIC_PATH = resolve(SRC_PATH, "public");

/**
 * Camelize given string
 * @returns string
 * @param str string
 */
const camelize = (str) =>
  str.replace(/^\w|[A-Z]|-|\b\w|\s+/g, (match, index) => {
    if (match === " " || match === "-") return "";
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
const PACKAGE_NAME = camelize(packageName);
// eslint-disable-next-line no-console
console.info(
  `Remote URL: ${PACKAGE_NAME}@http://${host}:${port}/remoteEntry.js`
);

/**
 * Add version to the shared libraries based on your dependencies
 */
const sharedWithVersions = Object.fromEntries(
  Object.entries(shared).map(([depName, depData]) => [
    depName,
    { ...depData, requiredVersion: deps[depName] },
  ])
);

const rules = {
  css: {
    test: /\.css$/i,
    use: ["style-loader", "css-loader"],
  },
  jsx: {
    test: /\.(ts|tsx|js|jsx)$/,
    include: [SRC_PATH],
    exclude: /node_modules/,
    loader: "babel-loader",
    options: {
      presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
      plugins: ["@babel/transform-runtime"]
    },
  },
  fonts: {
    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
    loader: "file-loader",
    include: fontConfig?.include
      ? resolve(processPath, fontConfig.include)
      : resolve(PUBLIC_PATH, "fonts"),
    options: {
      name: "[name].[ext]",
      outputPath: fontConfig?.outputPath
        ? resolve(processPath, fontConfig.outputPath)
        : "dist/public",
    },
  },
  images: {
    test: /\.(png|svg|jpg|jpeg|gif)$/i,
    type: "asset/resource",
  },
};

const webpackConfig = {
  mode: "none",
  context: SRC_PATH,
  entry: ENTRY_FILE_PATH,
  resolve: {
    extensions: [".jsx", ".js", ".json", ".tsx", ".ts"],
  },
  output: {
    path: PUBLIC_PATH,
    filename: "[name][contenthash].js",
  },
  module: {
    rules: [rules.css, rules.jsx, rules.images],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: resolve(processPath, "index.html") }),
    new ModuleFederationPlugin({
      name: PACKAGE_NAME,
      filename: "remoteEntry.js",
      exposes,
      shared: sharedWithVersions,
      remotes,
    }),
  ],
};

if (fontConfig) {
  webpackConfig.module.rules = [...webpackConfig.module.rules, rules.fonts];
}

module.exports = webpackConfig;
