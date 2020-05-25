const Sequelize = require('sequelize');

function create_models(sequelize) {
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
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            details: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: '',
            },
        },
        {
            timestamps: false,
        },
    );
    LogEntry.prototype.genCategory = function() {
        return Category.gen(this.category_id);
    }
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
        {
            timestamps: false,
        },
    );
    const Models = {LogEntry, Category};
    Object.keys(Models).forEach(name => {
        Models[name].gen = (id) => Models[name].findByPk(id);
    });
    return Models;
}

class Database {
    constructor(config) {
        this.sequelize = new Sequelize(
            config.name,
            config.username,
            config.password,
            {host: 'localhost', dialect: 'mysql'}
        );
        this.models = create_models(this.sequelize);
    }
    static async init(config) {
        const instance = new Database(config);
        return instance.sequelize.sync({force: true}).then(_ => instance);
    }
}

export default Database;
