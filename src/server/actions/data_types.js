/* eslint-disable func-names */

import { getDataTypeMapping } from '../../common/data_types';

const ActionsRegistry = {};

Object.entries(getDataTypeMapping()).forEach((pair) => {
    const [name, DataType] = pair;
    ActionsRegistry[`${name}-list`] = async function (input) {
        const context = { ...this, DataType };
        input = input || {};
        const where = input.where || {};
        await DataType.updateWhere.call(context, where);
        return DataType.list.call(context, where, input.limit);
    };
    ActionsRegistry[`${name}-typeahead`] = async function ({ query, where = {} }) {
        const context = { ...this, DataType };
        await DataType.updateWhere.call(context, where);
        return DataType.typeahead.call(context, { query, where });
    };
    ActionsRegistry[`${name}-validate`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.getValidationErrors.call(context, input);
    };
    ActionsRegistry[`${name}-load-partial`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.loadPartial.call(context, input.__id__);
    };
    ActionsRegistry[`${name}-load`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.load.call(context, input.__id__);
    };
    ActionsRegistry[`${name}-reorder`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.reorder.call(context, input);
    };
    ActionsRegistry[`${name}-upsert`] = async function (input) {
        const context = { ...this, DataType };
        if (DataType.trigger) {
            DataType.trigger.call(context, input);
        }
        const errors = await DataType.getValidationErrors.call(context, input);
        if (errors.length) {
            throw new Error(`${errors.join('\n')}\n${JSON.stringify(input, null, 4)}`);
        }
        const id = await DataType.save.call(context, input);
        // This informs the client-side DataLoader.
        this.broadcast(`${name}-load`, { __id__: id });
        this.broadcast(`${name}-list`, { where: { __id__: id } });
        return DataType.load.call(context, id);
    };
    ActionsRegistry[`${name}-delete`] = async function (id) {
        const context = { ...this, DataType };
        // This informs the client-side DataLoader.
        this.broadcast(`${name}-load`, { __id__: id });
        this.broadcast(`${name}-list`, { where: { __id__: id } });
        return DataType.delete.call(context, id);
    };
});

export default ActionsRegistry;
