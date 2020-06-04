import assert from './src/common/assert';
import './src/common/polyfill';

// Step 1: Load Configuration

const fs = require("fs");

const appConfig = JSON.parse(fs.readFileSync('./config.json'));

try {
  const appConfigExample = JSON.parse(fs.readFileSync('./config.json.example'));
  (function ensureSameStructure(left, right) {
    if (typeof left != "object" && typeof right != "object") {
      assert(typeof left == typeof right);
      return;
    }
    assert(typeof left == "object");
    assert(typeof right == "object");
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    assert(leftKeys.equals(rightKeys));
    leftKeys.forEach((key, index) => {
      ensureSameStructure(left[key], right[key]);
    });
  })(appConfig, appConfigExample);
} catch (error) {
  throw new Error("The format of ./config.json must match ./config.json.example");
}

// Step 2: Use webpack to build the client bundle.

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackCompiler = webpack(webpackConfig);
webpackCompiler.watch({poll: 100}, (err, stats) => {
  console.info('Webpack change detected. Recompiled!');
});

// Step 3: Use express to serve the client.

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
require('./src/server/index.js')(io, appConfig)
  .then(() => {
    app.get('/', (req, res) => {
      res.cookie('port', appConfig.port);
      res.sendFile('index.html', {root: 'dist'});
    });
    app.use(express.static('dist'));
    server.listen(appConfig.port);
  });
