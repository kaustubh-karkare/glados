/* eslint-disable func-names */

import { getDataTypeMapping } from '../data';
import ActionsRegistry from './ActionsRegistry';

Object.entries(getDataTypeMapping()).forEach((pair) => {
    const [name, DataType] = pair;
    ActionsRegistry[`${name}-list`] = async function (input) {
        const context = { ...this, DataType };
        const where = (input && input.where) || {};
        await DataType.updateWhere.call(context, where);
        return DataType.list.call(context, where);
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
        if (DataType.trigger) {
            DataType.trigger.call(context, input);
        }
        const errors = await DataType.validate.call(context, input);
        if (errors.length) {
            throw new Error(errors.join('\n'));
        }
        const id = await DataType.save.call(context, input);
        // This informs the client-side DataLoader.
        this.broadcast(`${name}-load`, { id });
        this.broadcast(`${name}-list`, { where: { id } });
        return DataType.load.call(context, id);
    };
    ActionsRegistry[`${name}-delete`] = async function (id) {
        const context = { ...this, DataType };
        return DataType.delete.call(context, id);
    };
});
