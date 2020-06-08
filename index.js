import assert from './src/common/assert';
import main from './src/server/index';
import './src/common/polyfill';

const express = require('express');
const fs = require('fs');
const http = require('http');
const SocketIO = require('socket.io');

// Step 1: Load Configuration

const appConfig = JSON.parse(fs.readFileSync('./config.json'));

try {
    const appConfigExample = JSON.parse(fs.readFileSync('./config.json.example'));
    (function ensureSameStructure(left, right) {
        if (typeof left !== 'object' && typeof right !== 'object') {
            assert(typeof left === typeof right);
            return;
        }
        assert(typeof left === 'object');
        assert(typeof right === 'object');
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        assert(leftKeys.equals(rightKeys));
        leftKeys.forEach((key) => {
            ensureSameStructure(left[key], right[key]);
        });
    }(appConfig, appConfigExample));
} catch (error) {
    throw new Error('The format of ./config.json must match ./config.json.example');
}

// Step 2: Use express to serve the client.

const app = express();
const server = http.Server(app);
const io = SocketIO(server);

main(io, appConfig)
    .then(() => {
        app.get('/', (req, res) => {
            res.cookie('port', appConfig.port);
            res.sendFile('index.html', { root: 'dist' });
        });
        app.use(express.static('dist'));
        server.listen(appConfig.port);
        // eslint-disable-next-line no-console
        console.info('Server ready!');
    });
