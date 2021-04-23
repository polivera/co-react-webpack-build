#!/usr/bin/env node
const path = require('path');
const shell = require('shelljs');

const MODULE_PATH = path.resolve(__dirname, '..');
shell.exec(`npx webpack serve --config ${MODULE_PATH}/webpack.base.js`);
