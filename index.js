const port = 80;

// Utility

function getTimePrefix() {
  const now = new Date();
  return '[' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString() + ']';
}
function addTimePrefix(name) {
  const original = console[name];
  console[name] = (...args) => {
    original(getTimePrefix(), ...args)
  }
}
addTimePrefix('error');
addTimePrefix('info');
addTimePrefix('log');
addTimePrefix('warning');

// Step 1: Use webpack to build the client bundle.

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

webpackConfig.plugins.forEach(plugin => {
  if (plugin.constructor.name == 'HtmlWebpackPlugin') {
    plugin.options.templateParameters = {port};
  }
});
const webpackCompiler = webpack(webpackConfig);
webpackCompiler.watch({poll: 100}, (err, stats) => {
  console.info('Webpack change detected. Recompiled!');
});

// Step 2: Use express to serve the client.

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
require('./src/server/index.js')(app, io);

app.use(express.static('dist'));
app.get('/', (req, res) => res.sendFile('index.html', {root: 'dist'}));

server.listen(port);
