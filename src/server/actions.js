/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */

import assert from 'assert';

// This method only exists within webpack, so we need to provide it for Jest.
// Note: babel-plugin-transform-require-context does not work for Jest.
// Source = https://stackoverflow.com/a/42191018/903585
if (typeof require.context === 'undefined') {
    // eslint-disable-next-line global-require
    const fs = require('fs');
    // eslint-disable-next-line global-require
    const path = require('path');
    require.context = (base = '.', scanSubDirectories = false, regularExpression = /\.js$/) => {
        const files = {};
        function readDirectory(directory) {
            fs.readdirSync(directory).forEach((file) => {
                const fullPath = path.resolve(directory, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    if (scanSubDirectories) readDirectory(fullPath);
                    return;
                }
                if (!regularExpression.test(fullPath)) return;
                files[fullPath] = true;
            });
        }
        readDirectory(path.resolve(__dirname, base));
        function Module(file) {
            // eslint-disable-next-line import/no-dynamic-require, global-require
            return require(file);
        }
        Module.keys = () => Object.keys(files);
        return Module;
    };
}

class ActionsRegistry {
    static get() {
        if (ActionsRegistry.result) {
            return ActionsRegistry.result;
        }
        const result = {};

        const actionsContext = require.context('./actions', false, /\.js$/);
        actionsContext.keys()
            .forEach((filePath) => {
                const exports = actionsContext(filePath);
                ActionsRegistry.build(result, exports.default);
            });

        const pluginsContext = require.context('../plugins', true, /actions\.js$/);
        pluginsContext.keys()
            .forEach((filePath) => {
                const exports = pluginsContext(filePath);
                ActionsRegistry.build(result, exports.default);
            });

        ActionsRegistry.result = result;
        return result;
    }

    static build(result, nameToMethods) {
        Object.entries(nameToMethods).forEach(([name, method]) => {
            const cacheSuffix = '-$cached';
            if (name.endsWith(cacheSuffix)) {
                ActionsRegistry.useCache(result, name.slice(0, -cacheSuffix.length), method);
            } else {
                result[name] = method;
            }
        });
    }

    static useCache(result, name, method) {
        const actualName = `${name}-actual`;
        result[actualName] = method;
        result[name] = async function (input = null) {
            const serializedInput = JSON.stringify(input);
            if (!(name in this.memory)) {
                this.memory[name] = {};
            }
            if (!(serializedInput in this.memory[name])) {
                this.memory[name][serializedInput] = new Promise((resolve, reject) => {
                    this.invoke.call(this, actualName, input).then(resolve).catch(reject);
                });
            }
            const promise = this.memory[name][serializedInput];
            assert(promise);
            return promise;
        };
        result[`${name}-refresh`] = async function (input = null) {
            const serializedInput = JSON.stringify(input);
            if (name in this.memory) {
                if (serializedInput in this.memory[name]) {
                    delete this.memory[name][serializedInput];
                }
            }
        };
    }
}

export default class {
    constructor(config, database) {
        this.config = config;
        this.database = database;
        this.registry = ActionsRegistry.get();
        this.memory = {};
        this.socket = null;
        this.broadcasts = null;
    }

    registerBroadcast(socket) {
        this.socket = socket;
    }

    getBroadcasts() { // used for tests
        const result = this.broadcasts;
        this.broadcasts = null;
        return result;
    }

    // eslint-disable-next-line class-methods-use-this
    has(name) {
        return name in this.registry;
    }

    async invoke(name, input, moreContext = {}) {
        const context = {
            ...moreContext,
            invoke(innerName, innerInput) {
                if (!(innerName in this.registry)) {
                    throw new Error(`unknown action: ${innerName}`);
                }
                try {
                    return this.registry[innerName].call(context, innerInput);
                } catch (error) {
                    const serializedInput = JSON.stringify(input, null, 4);
                    throw new Error(`${innerName}: ${serializedInput}\n\n${error.message}`);
                }
            },
            config: this.config,
            // The Object.create method creates a new object with the given prototype.
            // This allows us to concurrently set the transaction field below.
            database: Object.create(this.database),
            // The `registry` is used from the `invoke` method above.
            registry: this.registry,
            // The `memory` object is shared across all actions, used for caching.
            memory: this.memory,
            // Arguments for deferred `invoke` operations on separate transactions.
            deferredInvoke: [],
            // Transmit logs to client.
            console: {},
        };
        ['info', 'log', 'warning', 'error'].forEach((logLevel) => {
            context.console[logLevel] = (...args) => {
                if (this.socket) {
                    this.socket.log(logLevel, ...args);
                }
            };
        });
        context.database.transaction = await this.database.sequelize.transaction();
        try {
            const broadcasts = [];
            context.broadcast = (...args) => broadcasts.push(args);
            const response = await context.invoke.call(context, name, input); // action
            await context.database.transaction.commit();
            if (this.socket) {
                broadcasts.forEach((args) => this.socket.broadcast(...args));
            } else {
                this.broadcasts = broadcasts;
            }
            context.deferredInvoke.forEach((deferredArgs) => this.invoke(...deferredArgs));
            return response;
        } catch (error) {
            // console.error(error.toString());
            try {
                await context.database.transaction.rollback();
            } catch (anotherError) {
                throw error;
            }
            throw error;
        }
    }
}
