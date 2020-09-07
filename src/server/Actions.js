import ActionsRegistry from './ActionsRegistry';
import './Standard';
import './Reminders';
import './Custom';
import './Backup';
import './Migrations';

export default class {
    constructor(config, database) {
        this.config = config;
        this.database = database;
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
            return response;
        } catch (error) {
            // console.error(error.toString());
            await context.database.transaction.rollback();
            throw error;
        }
    }
}
