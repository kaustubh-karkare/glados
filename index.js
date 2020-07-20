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
const yargs = require('yargs');


async function init() {
    if (this.config.backup.load_on_startup && this.config.backup.save_interval_ms) {
        assert(false, 'Not allowed to auto-load and auto-save backups simultaneously.');
    }

    if (this.action === 'backup-load') {
        // Sequelize doesn't drop tables in the proper order,
        // so we just delete the whole file.
        if (fs.existsSync(this.config.database.location)) {
            fs.unlinkSync(this.config.database.location);
        }
    }
    this.database = await Database.init(
        this.config.database,
        { force: this.config.backup.load_on_startup },
    );
    this.actions = new Actions(this);

    if (this.action === 'backup-load') {
        const { filename } = await this.actions.invoke('backup-load');
        console.info(`Loaded ${filename}`);
        return;
    } if (this.action === 'backup-save') {
        const { filename, isUnchanged } = await this.actions.invoke('backup-save');
        console.info(`Saved ${filename}${isUnchanged ? ' (unchanged)' : ''}`);
        return;
    }

    const app = express();
    const server = http.Server(app);
    const io = SocketIO(server);
    io.on('connection', (socket) => SocketRPC.server(socket, this.actions));
    app.get('/', (req, res) => {
        res.cookie('port', this.config.server.port);
        res.cookie('data', this.config.backup.load_on_startup ? 'test' : 'prod');
        res.sendFile('index.html', { root: 'dist' });
    });
    app.use(express.static('dist'));
    this.server = server.listen(this.config.server.port, this.config.server.host);
    console.info('Server ready!');

    // eslint-disable-next-line no-use-before-define
    this.loopTimeout = setTimeout(loop.bind(this), this.config.backup.save_interval_ms);
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
    this.server.close();
    await loop.call(this);
    clearTimeout(this.loopTimeout);
    console.info('Terminated!');
}

// Put everything together!

const { argv } = yargs
    .option('configPath', { alias: 'c', default: 'config.json' })
    .demandOption('configPath')
    .option('action', { alias: 'a' })
    .choices('action', ['backup-load', 'backup-save']);

const context = {};
context.configPath = argv.configPath;
context.config = JSON.parse(fs.readFileSync(argv.configPath));
context.action = argv.action;

init.call(context)
    .catch((error) => console.error(error));

process.on('SIGTERM', cleanup.bind(context));
process.on('SIGINT', cleanup.bind(context));
