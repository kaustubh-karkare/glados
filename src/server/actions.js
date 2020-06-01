import assert from '../common/assert';

const Actions = {
    "category-list": async function() {
        return await this.database.sequelize.transaction(async transaction => {
            const {Category, LSDKey, CategoryToLSDKey} = this.database.models;
            const categories = await Category.findAll({
                include: {
                    model: LSDKey
                }
            });
            return categories.map(category => ({
                id: category.id,
                name: category.name,
                lsdKeys: category.lsd_keys.sort((left, right) => {
                    return left.categories_to_lsd_keys.ordering_index
                        - right.categories_to_lsd_keys.ordering_index;
                }).map(lsd_key => ({
                    id: lsd_key.id,
                    name: lsd_key.name,
                    valueType: lsd_key.value_type,
                })),
            }));
        });
    },
    "category-update": async function(input) {
        return await this.database.sequelize.transaction(async transaction => {
            let category = await this.database.create_or_update(
                'Category', {id: input.id, name: input.name}, transaction
            );
            let lsdKeys = await Promise.all(
                input.lsdKeys.map(async (lsdKey, index) => {
                    const logKey = await this.database.create_or_find(
                        'LSDKey',
                        {name: lsdKey.name},
                        {value_type: lsdKey.valueType},
                        transaction,
                    );
                    return {
                        id: logKey.id,
                        name: logKey.name,
                        valueType: logKey.value_type,
                    };
                })
            );
            let edges = await this.database.set_edges(
                'CategoryToLSDKey',
                'category_id',
                category.id,
                'lsd_key_id',
                lsdKeys.reduce((result, lsdKey, index) => {
                    result[lsdKey.id] = {ordering_index: index};
                    return result;
                }, {}),
                transaction,
            );
            return {
                id: category.id,
                name: category.name,
                lsdKeys
            };
        });
    },
    "category-delete": async function(input) {
        return await this.database.sequelize.transaction(async transaction => {
            return this.database.delete('Category', input, transaction);
        });
    },
    "lsd-key-typeahead": async function(input) {
        const lsd_keys = await this.database.get_all('LSDKey');
        return lsd_keys.map(item => ({
            id: item.id,
            name: item.name,
            valueType: item.value_type,
        }));
    },
    "log-entry-update": async function(input) {
        return await this.database.sequelize.transaction(async transaction => {
            let fields = {id: input.category.id, name: input.category.name};
            let category = await this.database.create_or_find('Category', fields, {}, transaction);
            let keyEdges = await this.database.get_edges(
                'CategoryToLSDKey',
                'category_id',
                category.id,
                transaction,
            );
            fields = {id: input.id, title: input.title, category_id: category.id};
            const log = await this.database.create_or_update('LogEntry', fields, transaction);
            let lsdValues = await Promise.all(
                input.lsdValues.map(async (lsdValue, index) => {
                    const logKey = await this.database.create_or_find(
                        'LSDKey',
                        {name: lsdValue.key_name},
                        {value_type: lsdValue.key_type},
                        transaction,
                    )
                    assert(logKey.value_type == lsdValue.key_type, "Mismatched key type!");
                    const logValue = await this.database.create_or_find(
                        'LSDValue',
                        {lsd_key_id: logKey.id, value_data: lsdValue.data},
                        {},
                        transaction,
                    );
                    return {
                        id: logValue.id,
                        key_id: logValue.lsd_key_id,
                        key_name: logKey.name,
                        key_type: logKey.value_type,
                        data: logValue.value_data,
                    };
                })
            );
            let keyIDs = lsdValues.map(lsdValue => lsdValue.key_id);
            assert(
                keyEdges.every(edge => keyIDs.includes(edge.lsd_key_id)),
                "Missing keys for selected category!",
            );
            let edges = await this.database.set_edges(
                'LogEntryToLSDValue',
                'log_entry_id',
                log.id,
                'lsd_value_id',
                lsdValues.reduce((result, lsdValue, index) => {
                    result[lsdValue.id] = {ordering_index: index};
                    return result;
                }, {}),
                transaction,
            );
            return {
                id: log.id,
                title: log.title,
                category: {id: log.category_id, name: category.name},
                lsdValues,
            };
        });
    },
};

export default Actions;
