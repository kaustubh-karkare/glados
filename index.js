/* eslint-disable no-console */

import './src/common/polyfill';
import assert from './src/common/assert';
import { Database } from './src/data';
import Actions from './src/data/Actions';
import SocketRPC from './src/common/SocketRPC';

const express = require('express');
const fs = require('fs');
const http = require('http');
const process = require('process');
const SocketIO = require('socket.io');

async function init() {
    if (this.loadBackup && this.saveBackups) {
        assert(false, 'Not allowed to auto-load and auto-save backups simultaneously.');
    }

    this.database = await Database.init(
        this.appConfig.database,
        { force: this.loadBackup },
    );
    this.actions = new Actions(this.database);

    if (this.loadBackup) {
        const { filename } = await this.actions.invoke('backup-load');
        console.info(`Loaded ${filename}`);
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
    if (this.saveBackups) {
        const { filename, isUnchanged } = await this.actions.invoke('backup-save');
        console.info(`Saved ${filename}${isUnchanged ? ' (unchanged)' : ''}`);
        if (this.previousBackupFilename && this.previousBackupFilename !== filename) {
            await this.actions.invoke('backup-delete', { filename: this.previousBackupFilename });
        }
        this.previousBackupFilename = filename;
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
context.loadBackup = true;
// context.saveBackups = true;
context.loopInterval = 60 * 1000;

init.call(context)
    .catch((error) => console.error(error));

process.on('SIGTERM', cleanup.bind(context));
process.on('SIGINT', cleanup.bind(context));
