const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

const processPath = process.cwd();
const PKG_JSON_FILE = resolve(processPath, 'package.json');

/**
 * Extract all the information from the package.json file
 */
const {
  allowedHosts = 'all',
  name: packageName,
  main: entryFileName = 'index.ts',
  sourceFolder = './src',
  host = 'localhost',
  port = 9000,
  shared = [],
  remotes = [],
  exposes = [],
  dependencies: deps,
  // todo: is there a better way to do this?
  // eslint-disable-next-line import/no-dynamic-require
} = require(PKG_JSON_FILE);
const path = require('path');

/**
 * Resolve paths and stuff
 */
const SRC_PATH = resolve(processPath, sourceFolder);
const ENTRY_FILE_PATH = resolve(SRC_PATH, entryFileName);
const DIST_PATH = resolve(processPath, './dist');

/**
 * Camelize given string
 * @returns string
 * @param str string
 */
const camelize = (str) =>
  str.replace(/^\w|[A-Z]|-|\b\w|\s+/g, (match, index) => {
    if (match === ' ' || match === '-') return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
const PACKAGE_NAME = camelize(packageName);

if (Object.keys(exposes).length > 0) {
  // eslint-disable-next-line no-console
  console.info(
    `Remote URL: ${PACKAGE_NAME}@http://${host}:${port}/remoteEntry.js`
  );
}

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
    use: ['style-loader', 'css-loader'],
  },
  jsx: {
    test: /\.(ts|tsx|js|jsx)$/,
    include: [SRC_PATH],
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', { modules: 'auto' }],
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      plugins: ['@babel/transform-runtime'],
    },
  },
  fonts: {
    test: /\.(ttf|eot|woff|woff2)$/i,
    type: 'asset',
  },
  // todo: Check if this should be asset or asset/resource
  images: {
    test: /\.(png|jpg|jpeg|gif)$/i,
    type: 'asset',
  },
  svg: {
    test: /\.svg$/,
    use: [
      {
        loader: '@svgr/webpack',
        options: {
          native: false,
        },
      },
    ],
  },
};

const webpackConfig = {
  mode: 'none',
  context: SRC_PATH,
  entry: ENTRY_FILE_PATH,
  devServer: {
    static: {
      directory: path.resolve(processPath, 'dist'),
    },
    host,
    port,
    open: true,
    hot: true,
    compress: true,
    allowedHosts,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json', '.tsx', '.ts'],
  },
  output: {
    path: DIST_PATH,
    filename: '[name][contenthash].js',
    clean: true,
  },
  module: {
    rules: [rules.css, rules.jsx, rules.images, rules.svg, rules.fonts],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: resolve(processPath, 'index.html') }),
    new ModuleFederationPlugin({
      name: PACKAGE_NAME,
      filename: 'remoteEntry.js',
      exposes,
      shared: sharedWithVersions,
      remotes,
    }),
  ],
};

module.exports = webpackConfig;
