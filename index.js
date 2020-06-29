/* eslint-disable no-console */

import './src/common/polyfill';
import { Database, loadData } from './src/data';
import Actions from './src/data/Actions';
import exampleData from './src/data/example';
import SocketRPC from './src/common/SocketRPC';

const express = require('express');
const fs = require('fs');
const http = require('http');
const process = require('process');
const SocketIO = require('socket.io');

async function init() {
    this.database = await Database.init(this.appConfig.database);
    this.actions = new Actions(this.database);

    if (this.useBackups) {
        const { filename } = await this.actions.invoke('backup-load');
        console.info(`Loaded ${filename}`);
    } else {
        await loadData(this.actions, exampleData);
        console.info('Example data loaded.');
    }

    const app = express();
    const server = http.Server(app);
    const io = SocketIO(server);
    io.on('connection', (socket) => SocketRPC.server(socket, this.actions));
    app.get('/', (req, res) => {
        res.cookie('port', this.appConfig.port);
        res.sendFile('index.html', { root: 'dist' });
    });
    app.use(express.static('dist'));
    this.server = server.listen(this.appConfig.port);
    console.info('Server ready!');

    // eslint-disable-next-line no-use-before-define
    this.loopTimeout = setTimeout(loop.bind(this), this.loopInterval);
}

async function loop() {
    clearTimeout(this.loopTimeout);
    if (this.useBackups) {
        const { filename, isUnchanged } = await this.actions.invoke('backup-save');
        console.info(`Saved ${filename}${isUnchanged ? ' (unchanged)' : ''}`);
    }
    this.loopTimeout = setTimeout(loop.bind(this), this.loopInterval);
}

async function cleanup() {
    if (this.cleaningUp) {
        return;
    }
    this.cleaningUp = true;

    console.info('Terminating ...');
    this.server.close();
    await loop.call(this);
    clearTimeout(this.loopTimeout);
    console.info('Terminated!');
}

// Put everything together!

const context = {};
context.appConfig = JSON.parse(fs.readFileSync('./config.json'));
context.useBackups = true;
context.loopInterval = 10 * 1000;

init.call(context)
    .catch((error) => console.error(error));

process.on('SIGTERM', cleanup.bind(context));
process.on('SIGINT', cleanup.bind(context));
