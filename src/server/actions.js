/* eslint-disable func-names */

import { updateCategoryTemplate } from '../common/LogCategory';
import LogEntry from '../common/LogEntry';
import LogTag from '../common/LogTag';

const Actions = {
    'log-category-list': async function () {
        return this.database.sequelize.transaction(async (transaction) => {
            const { LogCategory, LogKey } = this.database.models;
            const categories = await LogCategory.findAll({
                include: { model: LogKey },
                transaction,
            });
            return categories.map((logCategory) => ({
                id: logCategory.id,
                name: logCategory.name,
                logKeys: logCategory.log_keys.sort(
                    (left, right) => left.log_categories_to_log_keys.ordering_index
                        - right.log_categories_to_log_keys.ordering_index,
                ).map((key) => ({
                    id: key.id,
                    name: key.name,
                    type: key.type,
                })),
                template: logCategory.template,
            }));
        });
    },
    'log-category-upsert': async function (input) {
        return this.database.sequelize.transaction(async (transaction) => {
            const fields = {
                id: input.id,
                name: input.name,
                // TODO: This should not be needed, given the defaultValue.
                // It is set properly later.
                template: input.template,
            };
            let logCategory = await this.database.createOrUpdate(
                'LogCategory', fields, transaction,
            );
            const logKeys = await Promise.all(
                input.logKeys.map(async (inputLogKey) => {
                    let logKey;
                    if (inputLogKey.id < 0) {
                        logKey = await this.database.createOrFind(
                            'LogKey',
                            { name: inputLogKey.name },
                            { type: inputLogKey.type },
                            transaction,
                        );
                    } else {
                        logKey = await this.database.update(
                            'LogKey',
                            { id: inputLogKey.id, name: inputLogKey.name },
                            transaction,
                        );
                    }
                    return {
                        id: logKey.id,
                        name: logKey.name,
                        type: logKey.type,
                    };
                }),
            );
            const template = updateCategoryTemplate(input.template, input.logKeys, logKeys);
            logCategory = await this.database.update(
                'LogCategory', { id: logCategory.id, template }, transaction,
            );
            await this.database.setEdges(
                'LogCategoryToLogKey',
                'category_id',
                logCategory.id,
                'key_id',
                logKeys.reduce((result, logKey, index) => {
                    // eslint-disable-next-line no-param-reassign
                    result[logKey.id] = { ordering_index: index };
                    return result;
                }, {}),
                transaction,
            );
            return {
                id: logCategory.id,
                name: logCategory.name,
                logKeys,
                template: logCategory.template,
            };
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
            const fields = {
                id: inputLogTag.id,
                type: inputLogTag.type,
                name: inputLogTag.name,
            };
            const logTag = await this.database.createOrUpdate(
                'LogTag', fields, transaction,
            );
            // TODO: Trigger consistency update if name change.
            return {
                id: logTag.id,
                type: logTag.type,
                name: logTag.name,
            };
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
