/* eslint-disable func-names */

import { getDataTypeMapping } from './Mapping';
import { getTodayLabel } from '../common/DateUtils';

const ActionsRegistry = {};

Object.entries(getDataTypeMapping()).forEach((pair) => {
    const [name, DataType] = pair;
    ActionsRegistry[`${name}-list`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.list.call(context, input);
    };
    ActionsRegistry[`${name}-typeahead`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.typeahead.call(context, input);
    };
    ActionsRegistry[`${name}-validate`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.validate.call(context, input);
    };
    ActionsRegistry[`${name}-load`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.load.call(context, input.id);
    };
    ActionsRegistry[`${name}-reorder`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.reorder.call(context, input);
    };
    ActionsRegistry[`${name}-upsert`] = async function (input) {
        const context = { ...this, DataType };
        const id = await DataType.save.call(context, input);
        return DataType.load.call(context, id);
    };
    ActionsRegistry[`${name}-delete`] = async function (id) {
        const context = { ...this, DataType };
        return DataType.delete.call(context, id);
    };
});

ActionsRegistry.dates = async function () {
    const results = await this.database.count('LogEntry', {}, ['date'], this.transaction);
    const dates = new Set(results.filter((result) => result.date).map((result) => result.date));
    dates.add(getTodayLabel());
    return Array.from(dates).sort();
};

export default class {
    constructor(database) {
        this.database = database;
    }

    invoke(name, input) {
        try {
            return this.database.sequelize.transaction(async (transaction) => {
                const context = { database: this.database, transaction };
                const output = await ActionsRegistry[name].call(context, input);
                return output;
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            throw error;
        }
    }

    register(api) {
        Object.keys(ActionsRegistry).forEach((name) => {
            api.register(name, (input) => this.invoke(name, input));
        });
    }
}
