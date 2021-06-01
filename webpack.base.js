const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

const processPath = process.cwd();

const SRC_PATH = resolve(processPath, 'src');
const PKG_JSON_FILE = resolve(processPath, 'package.json');
const PUBLIC_PATH = resolve(SRC_PATH, 'public');

const {
  name: packageName,
  main: entryFileName,
  fonts: fontConfig,
  host = 'localhost',
  port = 9000,
  shared = [],
  remotes = [],
  exposes = [],
  dependencies: deps,
  devDependencies: devDeps,
  // eslint-disable-next-line import/no-dynamic-require
} = require(PKG_JSON_FILE);
const ENTRY_FILE_PATH = resolve(SRC_PATH, entryFileName);

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
    test: /\.jsx?$/,
    include: [SRC_PATH],
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
  },
  tsx: {
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/,
  },
  fonts: {
    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'file-loader',
    include: fontConfig?.include
      ? resolve(processPath, fontConfig.include)
      : resolve(PUBLIC_PATH, 'fonts'),
    options: {
      name: '[name].[ext]',
      outputPath: fontConfig?.outputPath
        ? resolve(processPath, fontConfig.outputPath)
        : 'dist/public',
    },
  },
  images: {
    test: /\.(png|svg|jpg|jpeg|gif)$/i,
    type: 'asset/resource',
  },
};

const webpackConfig = {
  context: SRC_PATH,
  entry: ENTRY_FILE_PATH,
  devServer: {
    host,
    port,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  output: {
    path: PUBLIC_PATH,
    filename: 'index.js',
  },
  module: {
    rules: [rules.css, rules.jsx, rules.images],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: resolve(PUBLIC_PATH, 'index.html') }),
    new ModuleFederationPlugin({
      name: PACKAGE_NAME,
      library: { type: 'var', name: PACKAGE_NAME },
      filename: 'remoteEntry.js',
      exposes,
      shared: sharedWithVersions,
      remotes,
    }),
  ],
};

if (fontConfig) {
  webpackConfig.module.rules = [...webpackConfig.module.rules, rules.fonts];
}

if (devDeps?.typescript) {
  webpackConfig.resolve.extensions = [
    ...webpackConfig.resolve.extensions,
    '.tsx',
    '.ts',
  ];
  webpackConfig.module.rules = [...webpackConfig.module.rules, rules.tsx];
}

module.exports = webpackConfig;
