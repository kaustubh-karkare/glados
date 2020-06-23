/* eslint-disable func-names */

import { getDataTypeMapping } from '../data';

const ActionsRegistry = {};

Object.entries(getDataTypeMapping()).forEach((pair) => {
    const [name, DataType] = pair;
    ActionsRegistry[`${name}-list`] = async function () {
        const items = await this.database.findAll(DataType.name, {}, this.transaction);
        return Promise.all(items.map((item) => DataType.load.call(this, item.id)));
    };
    ActionsRegistry[`${name}-typeahead`] = async function (input) {
        return DataType.typeahead.call(this, input);
    };
    ActionsRegistry[`${name}-validate`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.validate.call(context, input);
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
