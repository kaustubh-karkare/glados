import ActionsRegistry from './ActionsRegistry';
import './Standard';
import './Reminders';
import './Custom';
import './Backup';
import './Suggestions';

export default class {
    constructor(config, database) {
        this.config = config;
        this.database = database;
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
        return name in ActionsRegistry;
    }

    async invoke(name, input, moreContext = {}) {
        const context = {
            ...moreContext,
            invoke(innerName, innerInput) {
                if (!(name in ActionsRegistry)) {
                    throw new Error(`unknown action: ${name}`);
                }
                try {
                    return ActionsRegistry[innerName].call(context, innerInput);
                } catch (error) {
                    const serializedInput = JSON.stringify(input, null, 4);
                    throw new Error(`${name}: ${serializedInput}\n\n${error.message}`);
                }
            },
            config: this.config,
            // The Object.create method creates a new object with the given prototype.
            // This allows us to concurrently set the transaction field below.
            database: Object.create(this.database),
            // The `memory` object is shared across all actions, used for caching.
            memory: this.memory,
            // Arguments for deferred `invoke` operations on separate transactions.
            deferredInvoke: [],
        };
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
            await context.database.transaction.rollback();
            throw error;
        }
    }
}
