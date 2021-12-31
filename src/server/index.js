/* eslint-disable no-console */

import '../common/polyfill';

import express from 'express';
import fs from 'fs';
import http from 'http';
import process from 'process';
import SingleInstance from 'single-instance';
import SocketIO from 'socket.io';
import yargs from 'yargs';

import SocketRPC from '../common/SocketRPC';
import Actions from './actions';
import Database from './database';

async function init() {
    this.database = new Database(this.config.database);
    this.actions = new Actions(this.config, this.database);
}

async function startServer() {
    await this.actions.invoke('database-validate', { verbose: true });
    const app = express();
    const server = http.Server(app);
    const io = SocketIO(server);
    io.on('connection', (socket) => SocketRPC.server(socket, this.actions));
    const { host, port } = this.config.server;
    app.get('/', (req, res) => {
        res.cookie('host', host);
        res.cookie('port', port);
        res.sendFile('index.html', { root: 'dist' });
    });
    app.use(express.static('dist'));
    this.server = server.listen(port, host);
    console.info(`Server running at http://${host}:${port}`);
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
        await this.actions.invoke(argv.action, { verbose: true });
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
