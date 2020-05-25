import assert from '../common/assert';

class Actions {
    constructor(database) {
        this.database = database;
    }
    async genCreateCategory({name}) {
        const {Category} = this.database.models;
        return this.database.sequelize.transaction(async transaction => {
            return await Category.create({name}, {transaction});
        });
    }
    async genCreateLogEntry({name, category, category_id}) {
        const {Category, LogEntry} = this.database.models;
        return this.database.sequelize.transaction(async transaction => {
            if (!category) {
                assert(category_id);
                category = Category.gen(category_id);
            }
            const scheduled_time = parseInt(Date.now() / 1000);
            return await LogEntry.create({
                category_id,
                name,
            }, {transaction});
        });
    }
}

export default Actions;
