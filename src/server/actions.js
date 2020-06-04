/* eslint-disable func-names */

import assert from '../common/assert';

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
            }));
        });
    },
    'log-category-upsert': async function (input) {
        return this.database.sequelize.transaction(async (transaction) => {
            const logCategory = await this.database.createOrUpdate(
                'LogCategory', { id: input.id, name: input.name }, transaction,
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
            let fields = { id: input.logCategory.id, name: input.logCategory.name };
            const logCategory = await this.database.createOrFind('LogCategory', fields, {}, transaction);
            const logCategoryKeyEdges = await this.database.getEdges(
                'LogCategoryToLogKey',
                'category_id',
                logCategory.id,
                transaction,
            );
            fields = { id: input.id, title: input.title, category_id: logCategory.id };
            const logEntry = await this.database.createOrUpdate('LogEntry', fields, transaction);
            const logValues = await Promise.all(
                input.logValues.map(async (inputLogValue) => {
                    const logKey = await this.database.createOrFind(
                        'LogKey',
                        { name: inputLogValue.keyName },
                        { type: inputLogValue.keyType },
                        transaction,
                    );
                    assert(logKey.type === inputLogValue.keyType, 'Mismatched key type!');
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
            const logKeyIDs = logValues.map((value) => value.keyId);
            assert(
                logCategoryKeyEdges.every((edge) => logKeyIDs.includes(edge.key_id)),
                'Missing keys for selected category!',
            );
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
                logCategory: { id: logCategory.id, name: logCategory.name },
                logValues,
            };
        });
    },
    'log-value-typeahead': async function () {
        return [];
    },
};

export default Actions;
