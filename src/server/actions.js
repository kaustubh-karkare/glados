/* eslint-disable func-names */

import { LogCategory, LogEntry, LogTag } from '../data';

const Actions = {
    'log-category-list': async function () {
        return this.database.sequelize.transaction(async (transaction) => {
            const context = { database: this.database, transaction };
            const logCategories = await this.database.findAll(
                'LogCategory', {}, transaction,
            );
            const outputLogCategories = await Promise.all(
                logCategories.map(
                    (logCategory) => LogCategory.load.call(context, logCategory.id),
                ),
            );
            return outputLogCategories;
        });
    },
    'log-category-upsert': async function (input) {
        return this.database.sequelize.transaction(async (transaction) => {
            const context = { database: this.database, transaction };
            const id = await LogCategory.save.call(context, input);
            const outputLogCategory = await LogCategory.load.call(context, id);
            return outputLogCategory;
        });
    },
    'log-category-delete': async function (input) {
        return this.database.sequelize.transaction(async (transaction) => {
            const logCategory = await this.database.delete('LogCategory', { id: input.id }, transaction);
            return { id: logCategory.id };
        });
    },
    'log-key-list': async function () {
        const logKeys = await this.database.findAll('LogKey', {});
        return logKeys.map((logKey) => ({
            id: logKey.id,
            name: logKey.name,
            type: logKey.type,
        }));
    },
    'log-entry-typeahead': async function (input) {
        return this.database.sequelize.transaction(async (transaction) => {
            const where = {
                name: { [this.database.Op.like]: `${input.value}%` },
            };
            const logEntries = await this.database.findAll('LogEntry', where, transaction);
            const outputLogEntries = await Promise.all(
                logEntries.map((logEntry) => LogEntry.load.call(
                    { database: this.database, transaction }, logEntry.id,
                )),
            );
            return outputLogEntries;
        });
    },
    'log-entry-upsert': async function (input) {
        return this.database.sequelize.transaction(async (transaction) => {
            const context = { database: this.database, transaction };
            const id = await LogEntry.save.call(context, input);
            const outputLogEntry = await LogEntry.load.call(context, id);
            return outputLogEntry;
        });
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
        return this.database.sequelize.transaction(async (transaction) => {
            const logTags = await this.database.findAll('LogTag', {}, transaction);
            return logTags.map((logTag) => ({
                id: logTag.id,
                type: logTag.type,
                name: logTag.name,
            }));
        });
    },
    'log-tag-typeahead': async function (input) {
        return this.database.sequelize.transaction(async (transaction) => {
            const logTagType = LogTag.getTypes()[1]; // TODO: Use input.trigger
            const where = {
                type: logTagType.value,
                name: { [this.database.Op.like]: `${input.value}%` },
            };
            const logTags = await this.database.findAll('LogTag', where, transaction);
            const outputLogTags = logTags.map((logTag) => ({
                id: logTag.id,
                type: logTag.type,
                name: logTagType.prefix + logTag.name,
            }));
            return outputLogTags;
        });
    },
    'log-tag-upsert': async function (inputLogTag) {
        return this.database.sequelize.transaction(async (transaction) => {
            const context = { database: this.database, transaction };
            const id = await LogTag.save.call(context, inputLogTag);
            const outputLogTag = await LogTag.load.call(context, id);
            return outputLogTag;
        });
    },
    'log-tag-delete': async function (input) {
        return this.database.sequelize.transaction(async (transaction) => {
            const logTag = await this.database.delete('LogTag', { id: input.id }, transaction);
            return { id: logTag.id };
        });
    },
};

export default Actions;
