/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */

const childProcess = require('child_process');
const { assert } = require('console');

class StreamIntender {
    constructor(stream, prefix) {
        this.stream = stream;
        this.prefix = prefix;
        this.pending = true;
    }

    write(data) {
        let prefix = '';
        if (this.pending) {
            prefix += this.prefix;
            this.pending = false;
        }
        data.split('\n').forEach((line, index, lines) => {
            if (index < lines.length - 1) {
                this.stream.write(`${prefix + line}\n`);
                prefix = this.prefix;
            } else if (line) {
                this.stream.write(prefix + line);
            } else {
                this.pending = true;
            }
        });
    }
}

class Server {
    constructor(configPath) {
        this.configPath = configPath;
        this.process = null;
    }

    async start() {
        assert(!this.process);
        this.process = true;
        console.info('Initializing ...');
        const [command, ...args] = 'yarn run server -c'.split(' ').concat(this.configPath);
        const resetProcess = await this._spawn(command, args.concat('-a', 'database-reset'));
        await this._wait(resetProcess, 'Released lock!');
        console.info('Test database reset!');
        const serverProcess = await this._spawn(command, args);
        await this._wait(serverProcess, 'Server ready!');
        console.info('Test server started!');
        this.process = serverProcess;
    }

    async _spawn(command, args) {
        const currentProcessStdout = new StreamIntender(process.stdout, '    ');
        const serverProcess = childProcess.spawn(command, args);
        let stdoutBuffer = '';
        serverProcess.stdout.on('data', (data) => {
            data = data.toString();
            currentProcessStdout.write(data);
            stdoutBuffer += data;
            if (serverProcess.update) {
                serverProcess.update(stdoutBuffer);
            }
        });
        serverProcess.stdout.on('error', (error) => {
            error = error.toString();
            currentProcessStdout.write(error);
        });
        return serverProcess;
    }

    async _wait(serverProcess, phrase) {
        return new Promise((resolve) => {
            serverProcess.update = (stdout) => {
                if (stdout.includes(phrase)) {
                    resolve();
                }
            };
        });
    }

    async _terminate(serverProcess) {
        return new Promise((resolve, reject) => {
            serverProcess.on('close', (code) => {
                (code ? reject : resolve)(code);
            });
            serverProcess.kill();
        });
    }

    async stop() {
        if (this.process) {
            await this._terminate(this.process);
            this.process = null;
        }
    }
}

module.exports = Server;
