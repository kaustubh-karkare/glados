/* eslint-disable func-names */

import { getDataTypeMapping } from '../Mapping';
import ActionsRegistry from './Registry';

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
