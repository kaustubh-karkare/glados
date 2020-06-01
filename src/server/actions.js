import assert from '../common/assert';

const Actions = {
    "log-category-list": async function() {
        return await this.database.sequelize.transaction(async transaction => {
            const {LogCategory, LogKey} = this.database.models;
            const categories = await LogCategory.findAll({
                include: {model: LogKey},
            });
            return categories.map(logCategory => ({
                id: logCategory.id,
                name: logCategory.name,
                logKeys: logCategory.log_keys.sort((left, right) => {
                    return left.log_categories_to_log_keys.ordering_index
                        - right.log_categories_to_log_keys.ordering_index;
                }).map(key => ({
                    id: key.id,
                    name: key.name,
                    type: key.type,
                })),
            }));
        });
    },
    "log-category-upsert": async function(input) {
        return await this.database.sequelize.transaction(async transaction => {
            let logCategory = await this.database.create_or_update(
                'LogCategory', {id: input.id, name: input.name}, transaction
            );
            let logKeys = await Promise.all(
                input.logKeys.map(async (logKey, index) => {
                    logKey = await this.database.create_or_find(
                        'LogKey',
                        {name: logKey.name},
                        {type: logKey.type},
                        transaction,
                    );
                    return {
                        id: logKey.id,
                        name: logKey.name,
                        type: logKey.type,
                    };
                })
            );
            await this.database.set_edges(
                'LogCategoryToLogKey',
                'category_id',
                logCategory.id,
                'key_id',
                logKeys.reduce((result, logKey, index) => {
                    result[logKey.id] = {ordering_index: index};
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
    "log-category-delete": async function(input) {
        return await this.database.sequelize.transaction(async transaction => {
            const logCategory = await this.database.delete('LogCategory', input, transaction);
            return {id: logCategory.id};
        });
    },
    "log-key-list": async function(input) {
        const logKeys = await this.database.get_all('LogKey');
        return logKeys.map(logKey => ({
            id: logKey.id,
            name: logKey.name,
            type: logKey.type,
        }));
    },
    "log-entry-upsert": async function(input) {
        return await this.database.sequelize.transaction(async transaction => {
            let fields = {id: input.logCategory.id, name: input.logCategory.name};
            let logCategory = await this.database.create_or_find('LogCategory', fields, {}, transaction);
            let logCategoryKeyEdges = await this.database.get_edges(
                'LogCategoryToLogKey',
                'category_id',
                logCategory.id,
                transaction,
            );
            fields = {id: input.id, title: input.title, category_id: logCategory.id};
            const logEntry = await this.database.create_or_update('LogEntry', fields, transaction);
            let logValues = await Promise.all(
                input.logValues.map(async (logValue, index) => {
                    const logKey = await this.database.create_or_find(
                        'LogKey',
                        {name: logValue.keyName},
                        {type: logValue.keyType},
                        transaction,
                    )
                    assert(logKey.type == logValue.keyType, "Mismatched key type!");
                    logValue = await this.database.create_or_find(
                        'LogValue',
                        {key_id: logKey.id, data: logValue.data},
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
                })
            );
            let logKeyIDs = logValues.map(value => value.keyId);
            assert(
                logCategoryKeyEdges.every(edge => logKeyIDs.includes(edge.key_id)),
                "Missing keys for selected category!",
            );
            await this.database.set_edges(
                'LogEntryToLogValue',
                'entry_id',
                logEntry.id,
                'value_id',
                logValues.reduce((result, logValue, index) => {
                    result[logValue.id] = {ordering_index: index};
                    return result;
                }, {}),
                transaction,
            );
            return {
                id: logEntry.id,
                title: logEntry.title,
                logCategory: {id: logCategory.id, name: logCategory.name},
                logValues,
            };
        });
    },
    "log-value-typeahead": async function(input) {
        return [];
    },
};

export default Actions;
