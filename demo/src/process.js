/* eslint-disable max-classes-per-file */

const assert = require('assert');
const childProcess = require('child_process');

class ProcessWrapper {
    constructor(args) {
        assert(args.command && Array.isArray(args.argv) && args.stream);
        this.process = null;
        this._lastDataTimestamp = null; // Set from _onData, for waitUntilPause
        this._outputBuffer = ''; // Set from _onData, for waitUntilOutput
        this._checkForOutput = null; // Set from waitUntilOutput
        this._pauseInterval = null; // Set from waitUntilPause
        this._args = args;
    }

    async start() {
        const {
            command, argv, stream, verbose,
        } = this._args;
        this._lastDataTimestamp = Date.now();
        if (verbose) {
            stream.write(`$ ${[command, ...argv].join(' ')}\n`);
        }
        this.process = childProcess.spawn(command, argv);
        this.process.stdout.on('data', (data) => this._onData(data));
        this.process.stderr.on('data', (data) => this._onData(data));
        this.process.on('exit', () => {
            this.process.stdin.end();
            this.process.stdout.destroy();
            this.process.stderr.destroy();
        });
    }

    _onData(data) {
        const { stream, verbose } = this._args;
        this._lastDataTimestamp = Date.now();
        data = data.toString();
        if (verbose) {
            stream.write(data);
        }
        this._outputBuffer += data;
        if (this._checkForOutput) {
            this._checkForOutput();
        }
    }

    async waitUntilOutput(text) {
        assert(!!this.process);
        if (this._outputBuffer.includes(text)) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this._checkForOutput = () => {
                if (this._outputBuffer.includes(text)) {
                    this._checkForOutput = null;
                    resolve();
                }
            };
        });
    }

    async waitUntilPause(duration) {
        assert(!!this.process);
        return new Promise((resolve) => {
            this._pauseInterval = setInterval(() => {
                const delta = Date.now() - this._lastDataTimestamp;
                if (delta > duration) {
                    clearInterval(this._pauseInterval);
                    this._pauseInterval = null;
                    resolve();
                }
            }, 100);
        });
    }

    async waitUntilExit() {
        assert(!!this.process);
        return new Promise((resolve) => {
            this.process.on('close', resolve);
        });
    }

    async stop() {
        assert(!!this.process);
        return new Promise((resolve) => {
            this.process.on('close', resolve);
            this.process.kill();
        });
    }
}

class StreamIntender {
    constructor(stream, prefix) {
        this._stream = stream;
        this._prefix = prefix;
        this._pending = true;
    }

    write(data) {
        let prefix = '';
        if (this._pending) {
            prefix += this._prefix;
            this._pending = false;
        }
        data.split('\n').forEach((line, index, lines) => {
            if (index < lines.length - 1) {
                this._stream.write(`${prefix + line}\n`);
                prefix = this._prefix;
            } else if (line) {
                this._stream.write(prefix + line);
            } else {
                this._pending = true;
            }
        });
    }
}

module.exports = { ProcessWrapper, StreamIntender };
