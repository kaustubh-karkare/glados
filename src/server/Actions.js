import ActionsRegistry from './ActionsRegistry';
import './Standard';
import './Reminders';
import './Custom';
import './Backup';

export default class {
    constructor(context) {
        this.context = context;
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

    async invoke(name, input) {
        const broadcasts = [];
        const { sequelize } = this.context.database;
        const response = await sequelize.transaction(async (transaction) => {
            const { database, ...moreContext } = this.context;
            const context = {
                broadcast: (...args) => broadcasts.push(args),
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
                // The Object.create method creates a new object with the given prototype.
                // This allows us to concurrently set the transaction field below.
                database: Object.create(database),
                ...moreContext,
            };
            context.database.transaction = transaction;
            return context.invoke.call(context, name, input);
        });
        // Now that the transactions has been committed ...
        if (this.socket) {
            broadcasts.forEach((args) => this.socket.broadcast(...args));
        } else {
            this.broadcasts = broadcasts;
        }
        return response;
    }
}
