/* eslint-disable func-names */

import { getDataTypeMapping, LogCategory } from '../data';

const ActionsRegistry = {
    'log-category-list': async function () {
        const logCategories = await this.database.findAll(
            'LogCategory', {}, this.transaction,
        );
        const outputLogCategories = await Promise.all(
            logCategories.map(
                (logCategory) => LogCategory.load.call(this, logCategory.id),
            ),
        );
        return outputLogCategories;
    },
    'log-tag-list': async function () {
        const logTags = await this.database.findAll('LogTag', {}, this.transaction);
        return logTags.map((logTag) => ({
            id: logTag.id,
            type: logTag.type,
            name: logTag.name,
        }));
    },
};

Object.entries(getDataTypeMapping()).forEach((pair) => {
    const [name, DataType] = pair;
    ActionsRegistry[`${name}-typeahead`] = async function (input) {
        return DataType.typeahead.call(this, input);
    };
    ActionsRegistry[`${name}-load`] = async function (input) {
        return DataType.load.call(this, input.id);
    };
    ActionsRegistry[`${name}-upsert`] = async function (input) {
        const id = await DataType.save.call(this, input);
        return DataType.load.call(this, id);
    };
    ActionsRegistry[`${name}-delete`] = async function (input) {
        const item = await this.database.delete(
            DataType.name, { id: input.id }, this.transaction,
        );
        return { id: item.id };
    };
});

export default class {
    constructor(database) {
        this.database = database;
    }

    invoke(name, input) {
        return this.database.sequelize.transaction(async (transaction) => {
            const context = { database: this.database, transaction };
            const output = await ActionsRegistry[name].call(context, input);
            return output;
        });
    }

    register(api) {
        Object.keys(ActionsRegistry).forEach((name) => {
            api.register(name, (input) => this.invoke(name, input));
        });
    }
}
