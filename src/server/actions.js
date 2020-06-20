/* eslint-disable func-names */

import assert from '../common/assert';
import { updateCategoryTemplate } from '../common/LogCategory';

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
            const logCategory = await this.database.delete('LogCategory', input, transaction);
            return { id: logCategory.id };
        });
    },
    'log-key-list': async function () {
        const logKeys = await this.database.getAll('LogKey');
        return logKeys.map((logKey) => ({
            id: logKey.id,
            name: logKey.name,
            type: logKey.type,
        }));
    },
    'log-entry-upsert': async function (input) {
        return this.database.sequelize.transaction(async (transaction) => {
            let logCategory = null;
            if (input.logCategory.id > 0) {
                logCategory = await this.database.find('LogCategory', { id: input.logCategory.id });
            }
            const fields = {
                id: input.id,
                title: input.title,
                category_id: logCategory ? logCategory.id : null,
                details: input.details,
            };
            const logEntry = await this.database.createOrUpdate('LogEntry', fields, transaction);
            const logValues = await Promise.all(
                input.logValues.map(async (inputLogValue) => {
                    const logKey = await this.database.createOrFind(
                        'LogKey',
                        { name: inputLogValue.logKey.name },
                        { type: inputLogValue.logKey.type },
                        transaction,
                    );
                    assert(logKey.type === inputLogValue.logKey.type, 'Mismatched key type!');
                    const logValue = await this.database.createOrFind(
                        'LogValue',
                        { key_id: logKey.id, data: inputLogValue.data },
                        {},
                        transaction,
                    );
                    return {
                        id: logValue.id,
                        logKey: {
                            id: logKey.id,
                            name: logKey.name,
                            type: logKey.type,
                        },
                        data: logValue.data,
                    };
                }),
            );
            if (logCategory) {
                const logCategoryKeys = await this.database.getNodesByEdge(
                    'LogCategoryToLogKey',
                    'category_id',
                    logCategory.id,
                    'key_id',
                    'LogKey',
                    transaction,
                );
                assert(
                    logCategoryKeys.map((logKey) => logKey.id).equals(
                        logValues.map((logValue) => logValue.logKey.id),
                    ),
                    `${'Missing keys for selected category!'
                        + '\nExpected = '}${logCategoryKeys.map((logKey) => logKey.name).join(', ')
                    }\nActual = ${logValues.map((logValue) => logValue.logKey.name).join(', ')}`,
                );
            }
            await this.database.setEdges(
                'LogEntryToLogValue',
                'entry_id',
                logEntry.id,
                'value_id',
                logValues.reduce((result, logValue, index) => {
                    // eslint-disable-next-line no-param-reassign
                    result[logValue.id] = { ordering_index: index };
                    return result;
                }, {}),
                transaction,
            );
            return {
                id: logEntry.id,
                title: logEntry.title,
                details: logEntry.details,
                logCategory: logEntry.category_id ? ({
                    id: logCategory.id,
                    name: logCategory.name,
                    logKeys: logValues.map((logValue) => logValue.logKey),
                    template: logCategory.template,
                }) : input.logCategory,
                logValues,
            };
        });
    },
    'log-value-typeahead': async function (inputLogValue) {
        const { LogValue } = this.database.models;
        const { logKey } = inputLogValue;
        const matchingLogValues = await LogValue.findAll({
            where: { key_id: inputLogValue.logKey.id },
        });
        return matchingLogValues.map((logValue) => ({
            id: logValue.id,
            data: logValue.data,
            logKey,
        }));
    },
};

export default Actions;
