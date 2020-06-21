/* eslint-disable func-names */

import { LogCategory, LogEntry, LogTag } from '../data';

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
    'log-category-upsert': async function (input) {
        const id = await LogCategory.save.call(this, input);
        const outputLogCategory = await LogCategory.load.call(this, id);
        return outputLogCategory;
    },
    'log-category-delete': async function (input) {
        const logCategory = await this.database.delete('LogCategory', { id: input.id }, this.transaction);
        return { id: logCategory.id };
    },
    'log-key-list': async function () {
        const logKeys = await this.database.findAll('LogKey', {}, this.transaction);
        return logKeys.map((logKey) => ({
            id: logKey.id,
            name: logKey.name,
            type: logKey.type,
        }));
    },
    'log-entry-typeahead': async function (input) {
        const where = {
            name: { [this.database.Op.like]: `${input.value}%` },
        };
        const logEntries = await this.database.findAll('LogEntry', where, this.transaction);
        const outputLogEntries = await Promise.all(
            logEntries.map((logEntry) => LogEntry.load.call(this, logEntry.id)),
        );
        return outputLogEntries;
    },
    'log-entry-upsert': async function (input) {
        const id = await LogEntry.save.call(this, input);
        const outputLogEntry = await LogEntry.load.call(this, id);
        return outputLogEntry;
    },
    'log-entry-delete': async function (input) {
        const logEntry = await this.database.delete('LogEntry', { id: input.id }, this.transaction);
        return { id: logEntry.id };
    },
    'log-value-typeahead': async function (inputLogValue) {
        const matchingLogValues = await this.database.findAll(
            'LogValue',
            { where: { key_id: inputLogValue.logKey.id } },
        );
        return matchingLogValues.map((logValue) => ({
            id: logValue.id,
            data: logValue.data,
            logKey: inputLogValue.logKey,
        }));
    },
    'log-tag-list': async function () {
        const logTags = await this.database.findAll('LogTag', {}, this.transaction);
        return logTags.map((logTag) => ({
            id: logTag.id,
            type: logTag.type,
            name: logTag.name,
        }));
    },
    'log-tag-typeahead': async function (input) {
        const logTagType = LogTag.getTypes()[1]; // TODO: Use input.trigger
        const where = {
            type: logTagType.value,
            name: { [this.database.Op.like]: `${input.value}%` },
        };
        const logTags = await this.database.findAll('LogTag', where, this.transaction);
        const outputLogTags = logTags.map((logTag) => ({
            id: logTag.id,
            type: logTag.type,
            name: logTagType.prefix + logTag.name,
        }));
        return outputLogTags;
    },
    'log-tag-upsert': async function (inputLogTag) {
        const id = await LogTag.save.call(this, inputLogTag);
        const outputLogTag = await LogTag.load.call(this, id);
        return outputLogTag;
    },
    'log-tag-delete': async function (input) {
        const logTag = await this.database.delete('LogTag', { id: input.id }, this.transaction);
        return { id: logTag.id };
    },
};

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
