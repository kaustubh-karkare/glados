/* eslint-disable no-console */

import '../common/polyfill';
import Database from './Database';
import Actions from './Actions';
import SocketRPC from '../common/SocketRPC';

const express = require('express');
const fs = require('fs');
const http = require('http');
const process = require('process');
const SingleInstance = require('single-instance');
const SocketIO = require('socket.io');
const yargs = require('yargs');


async function init() {
    // This method should return true if cleanup should be called immediately, false if not.

    this.database = new Database(this.config.database);
    this.actions = new Actions(this.config, this.database);

    if (this.action) {
        await this.actions.invoke(this.action, { logging: true });
        return true;
    }

    const app = express();
    const server = http.Server(app);
    const io = SocketIO(server);
    io.on('connection', (socket) => SocketRPC.server(socket, this.actions));
    app.get('/', (req, res) => {
        res.cookie('host', this.config.server.host);
        res.cookie('port', this.config.server.port);
        res.cookie('client', JSON.stringify(this.config.client));
        res.sendFile('index.html', { root: 'dist' });
    });
    app.use(express.static('dist'));
    this.server = server.listen(this.config.server.port, this.config.server.host);
    console.info('Server ready!');

    // eslint-disable-next-line no-use-before-define
    this.loopTimeout = setTimeout(loop.bind(this), this.config.backup.save_interval_ms);
    return false;
}

async function loop() {
    clearTimeout(this.loopTimeout);
    if (this.config.backup.save_interval_ms) {
        const { filename, isUnchanged } = await this.actions.invoke('backup-save');
        console.info(`Saved ${filename}${isUnchanged ? ' (unchanged)' : ''}`);
        if (this.previousBackupFilename && this.previousBackupFilename !== filename) {
            await this.actions.invoke('backup-delete', { filename: this.previousBackupFilename });
        }
        this.previousBackupFilename = filename;
    }
    this.loopTimeout = setTimeout(loop.bind(this), this.config.backup.save_interval_ms);
}

async function cleanup() {
    if (this.cleaningUp) {
        return;
    }
    this.cleaningUp = true;

    console.info('Terminating ...');
    if (this.server) {
        this.server.close();
    }
    await loop.call(this);
    clearTimeout(this.loopTimeout);
    if (this.database) {
        this.database.close();
    }
    console.info('Terminated!');
    if (this.resolve) {
        this.resolve();
    }
}

// Put everything together!

const { argv } = yargs
    .option('configPath', { alias: 'c', default: 'config.json' })
    .demandOption('configPath')
    .option('action', { alias: 'a' })
    .choices('action', ['database-reset', 'backup-load', 'backup-save']);

const context = {};
context.config = JSON.parse(fs.readFileSync(argv.configPath));
context.action = argv.action;

const locker = new SingleInstance(context.config.lock_name || 'glados');
console.info('Acquiring lock ...');
locker.lock()
    .then(() => {
        console.info('Acquired lock!');
        return init.call(context);
    })
    .then((result) => {
        if (result) {
            return cleanup.call(context);
        }
        return new Promise((resolve) => {
            context.resolve = resolve;
        });
    })
    .finally(() => {
        console.info('Releasing lock ...');
        locker.unlock()
            .then(() => console.info('Released lock!'));
    })
    .catch((error) => console.error(error));

process.on('SIGTERM', cleanup.bind(context));
process.on('SIGINT', cleanup.bind(context));
