import assert from '../common/assert';

class Actions {
    constructor(database) {
        this.database = database;
    }

    async genCreateLSDKey({name, value_type}) {
        const {LSDKey} = this.database.models;
        return await LSDKey.create({name, value_type});
    }

    async genRenameLSDKey({id, name}) {
        const {LSDKey} = this.database.models;
        const lsd_key = await LSDKey.gen(id);
        lsd_key.name = name;
        return await lsd_key.save();
    }

    async genCreateCategory({name}) {
        const {Category} = this.database.models;
        return await Category.create({name});
    }

    async genRenameCategory({id, name}) {
        const {Category} = this.database.models;
        const category = await Category.gen(id);
        category.name = name;
        return await category.save();
    }

    async genSetCategoryKeys({category_id, lsd_key_ids}) {
        const {Category, LSDKey, CategoryToLSDKey} = this.database.models;
        assert(new Set(lsd_key_ids).size == lsd_key_ids.length);
        // TODO: Assert all LogEntries with this category have these LSDKeys.
        return this.database.sequelize.transaction(async transaction => {
            await Promise.all(
                lsd_key_ids.map(async (lsd_key_id, ordering_index) => {
                    return await CategoryToLSDKey.create(
                        {category_id, lsd_key_id, ordering_index},
                        // Why specify fields? https://github.com/sequelize/sequelize/issues/11417
                        {fields: ['category_id', 'lsd_key_id', 'ordering_index'], transaction},
                    );
                }),
            );
        });
    }

    async genCreateLogEntry({title, category, category_id}) {
        const {Category, LogEntry} = this.database.models;
        return this.database.sequelize.transaction(async transaction => {
            if (!category) {
                assert(category_id);
                category = Category.gen(category_id);
            }
            const scheduled_time = parseInt(Date.now() / 1000);
            return await LogEntry.create({
                category_id,
                title,
            }, {transaction});
        });
    }
}

export default Actions;
