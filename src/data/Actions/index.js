import ActionsRegistry from './Registry';
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
        try {
            const broadcasts = [];
            const { sequelize } = this.context.database;
            const response = await sequelize.transaction(async (transaction) => {
                const context = {
                    broadcast: (...args) => broadcasts.push(args),
                    invoke(innerName, innerInput) {
                        return ActionsRegistry[innerName].call(context, innerInput);
                    },
                    transaction,
                    ...this.context,
                };
                const output = await ActionsRegistry[name].call(context, input);
                return output;
            });
            // Now that the transactions has been committed ...
            if (this.socket) {
                broadcasts.forEach((args) => this.socket.broadcast(...args));
            } else {
                this.broadcasts = broadcasts;
            }
            return response;
        } catch (error) {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // eslint-disable-next-line no-console
                console.error(error);
            }
            throw error;
        }
    }
}
