const Sequelize = require('sequelize');

function create_models(sequelize) {
    const options = {
        timestamps: false,
        underscored: true,
    };

    const Category = sequelize.define(
        'categories',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        options,
    );
    const LSDKey = sequelize.define(
        'lsd_keys',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            value_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        options,
    );
    const CategoryToLSDKey = sequelize.define(
        'categories_to_lsd_keys',
        {
            category_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: Category,
                    key: 'id',
                },
            },
            lsd_key_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LSDKey,
                    key: 'id',
                },
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            }
        },
        options,
    );
    Category.belongsToMany(LSDKey, { through: CategoryToLSDKey, onDelete: 'restrict', onUpdate: 'restrict' });
    LSDKey.belongsToMany(Category, { through: CategoryToLSDKey, onDelete: 'restrict', onUpdate: 'restrict' });

    const LogEntry = sequelize.define(
        'log_entries',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            details: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: '',
            },
        },
        options,
    );
    LogEntry.prototype.genCategory = function() {
        return Category.gen(this.category_id);
    }
    const Models = {Category, LSDKey, CategoryToLSDKey, LogEntry};
    Object.keys(Models).forEach(name => {
        Models[name].gen = (id) => Models[name].findByPk(id);
    });
    return Models;
}

class Database {
    constructor(config) {
        const options = {
            logging: false
        };
        if (config.type == 'mysql') {
            options.dialect = 'mysql';
            options.host = 'localhost';
        } else if (config.type == 'sqlite') {
            options.dialect = 'sqlite';
            options.storage = ':memory:';
        } else {
            assert(false, "unknown database type");
        }
        this.sequelize = new Sequelize(
            config.name,
            config.username,
            config.password,
            options,
        );
        this.models = create_models(this.sequelize);
    }
    async close() {
        await this.sequelize.close();
    }
    static async init(config) {
        const instance = new Database(config);
        return instance.sequelize.sync({force: true}).then(_ => instance);
    }
}

export default Database;
