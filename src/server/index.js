/* eslint-disable no-console */

import '../common/polyfill';
import Database from './database';
import Actions from './actions';
import SocketRPC from '../common/socket_rpc';

const express = require('express');
const fs = require('fs');
const http = require('http');
const process = require('process');
const SingleInstance = require('single-instance');
const SocketIO = require('socket.io');
const yargs = require('yargs');

async function init() {
    this.database = new Database(this.config.database);
    this.actions = new Actions(this.config, this.database);
}

async function startServer() {
    const app = express();
    const server = http.Server(app);
    const io = SocketIO(server);
    io.on('connection', (socket) => SocketRPC.server(socket, this.actions));
    app.get('/', (req, res) => {
        res.cookie('host', this.config.server.host);
        res.cookie('port', this.config.server.port);
        res.sendFile('index.html', { root: 'dist' });
    });
    app.use(express.static('dist'));
    this.server = server.listen(this.config.server.port, this.config.server.host);
    console.info('Server ready!');
}

async function cleanup() {
    if (this.server) {
        this.server.close();
    }
    if (this.database) {
        this.database.close();
    }
}

async function main(argv) {
    if (this === global) {
        main.call({}, argv);
        return;
    }

    this.config = JSON.parse(fs.readFileSync(argv.configPath));

    const locker = new SingleInstance(this.config.lock_name || 'glados');
    console.info('Acquiring lock ...');
    await locker.lock();
    console.info('Acquired lock!');

    await init.call(this);
    if (argv.action) {
        await this.actions.invoke(argv.action, { logging: true });
    } else {
        await startServer.call(this);
        // Let the server run until we get a signal.
        await new Promise((resolve) => {
            process.on('SIGTERM', resolve);
            process.on('SIGINT', resolve);
        });
    }
    await cleanup.call(this);

    console.info('Releasing lock ...');
    await locker.unlock();
    console.info('Released lock!');
}

// Put everything together!

const { argv } = yargs
    .option('configPath', { alias: 'c', default: 'config.json' })
    .demandOption('configPath')
    .option('action', { alias: 'a' })
    .choices('action', ['database-reset', 'backup-load', 'backup-save']);

main(argv).catch((error) => console.error(error));
