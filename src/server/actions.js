import assert from '../common/assert';

class Actions {
    constructor(database, socket) {
        this.database = database;
    }

    async getCategories() {
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
    }

    async createOrUpdateCategory(input) {
        return await this.database.sequelize.transaction(async transaction => {
            let category = await this.database.create_or_update(
                'Category', {id: input.id, name: input.name}, transaction
            );
            let lsdKeys = await Promise.all(
                input.lsdKeys.map(async (lsdKey, index) => this.database.create_or_find(
                        'LSDKey',
                        {name: lsdKey.name},
                        {value_type: lsdKey.valueType},
                        transaction,
                    )
                )
            );
            let map1 = {};
            let map2 = {};
            lsdKeys.forEach((lsdKey, index) => {
                map1[lsdKey.id] = {ordering_index: index}
                map2[lsdKey.id] = lsdKey;
            });
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
                lsdKeys: edges
                    .sort((left, right) => left.ordering_index - right.ordering_index)
                    .map(edge => map2[edge.lsd_key_id])
                    .map(item => ({
                        id: item.id,
                        name: item.name,
                        valueType: item.value_type,
                    }))
            };
        });
    }

    async deleteCategory(input) {
        return await this.database.sequelize.transaction(async transaction => {
            return this.database.delete('Category', input, transaction);
        });
    }

    async getLsdKeys(input) {
        const lsd_keys = await this.database.get_all('LSDKey');
        return lsd_keys.map(item => ({
            id: item.id,
            name: item.name,
            valueType: item.value_type,
        }));
    }

    async genCreateLogEntry({title, details, category_id, lsd_values = []}) {
        const {LogEntry, LSDValue, LogEntryToLSDValue} = this.database.models;
        return this.database.sequelize.transaction(async transaction => {
            // TODO: Assert that LD values exist for LSD keys associated with this category.
            const log_entry = await LogEntry.create({title, details, category_id}, {transaction});
            await Promise.all(
                lsd_values.map(async ({lsd_key_id, value_data}, ordering_index) => {
                    const [lsd_value, _] = await LSDValue.findOrCreate(
                        {where: {lsd_key_id, value_data}, transaction},
                    );
                    await LogEntryToLSDValue.create(
                        {log_entry_id: log_entry.id, lsd_value_id: lsd_value.id, ordering_index},
                        // Why specify fields? https://github.com/sequelize/sequelize/issues/11417
                        {fields: ['log_entry_id', 'lsd_value_id', 'ordering_index'], transaction},
                    );
                }),
            );
            return log_entry;
        });
    }
}

export default Actions;
