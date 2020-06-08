import assert from '../common/assert';

const Sequelize = require('sequelize');

function createModels(sequelize) {
    const options = {
        timestamps: false,
        underscored: true,
    };

    const LogCategory = sequelize.define(
        'log_categories',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['name'] },
            ],
        },
    );

    const LogKey = sequelize.define(
        'log_keys',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['name'] },
            ],
        },
    );

    const LogCategoryToLogKey = sequelize.define(
        'log_categories_to_log_keys',
        {
            category_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogCategory,
                    key: 'id',
                },
            },
            key_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogKey,
                    key: 'id',
                },
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        options,
    );

    LogCategory.belongsToMany(LogKey, {
        through: LogCategoryToLogKey,
        foreignKey: 'category_id',
        // Allow the edge to be deleted with the category.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogKey.belongsToMany(LogCategory, {
        through: LogCategoryToLogKey,
        foreignKey: 'key_id',
        // Don't allow key to be deleted if there are
        // categories that depend on it.
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogValue = sequelize.define(
        'log_values',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            key_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            data: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['key_id', 'data'] },
            ],
        },
    );

    LogKey.hasMany(LogValue, {
        foreignKey: 'key_id',
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogEntry = sequelize.define(
        'log_entries',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
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

    LogCategory.hasMany(LogEntry, {
        foreignKey: 'category_id',
        allowNull: true,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogEntryToLogValue = sequelize.define(
        'log_entries_to_log_values',
        {
            entry_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogEntry,
                    key: 'id',
                },
            },
            value_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogValue,
                    key: 'id',
                },
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        options,
    );

    LogEntry.belongsToMany(LogValue, {
        through: LogEntryToLogValue,
        foreignKey: 'entry_id',
        // Deleteing an Entry is allowed!
        // The links will be broken, and the Values could be cleaned up.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogValue.belongsToMany(LogEntry, {
        through: LogEntryToLogValue,
        foreignKey: 'value_id',
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    return {
        LogCategory, LogKey, LogCategoryToLogKey, LogValue, LogEntry, LogEntryToLogValue,
    };
}

class Database {
    static async init(config) {
        const instance = new Database(config);
        return instance.sequelize.sync({ force: false }).then(() => instance);
    }

    constructor(config) {
        const options = {
            logging: false,
        };
        if (config.type === 'mysql') {
            options.dialect = 'mysql';
            options.host = 'localhost';
        } else if (config.type === 'sqlite') {
            options.dialect = 'sqlite';
            options.storage = ':memory:';
        } else {
            assert(false, 'unknown database type');
        }
        this.sequelize = new Sequelize(
            config.name,
            config.username,
            config.password,
            options,
        );
        this.models = createModels(this.sequelize);
    }

    async close() {
        await this.sequelize.close();
    }

    async create(name, fields, transaction) {
        const { id, ...remainingFields } = fields;
        const Model = this.models[name];
        return Model.create(
            remainingFields,
            // Why specify fields? https://github.com/sequelize/sequelize/issues/11417
            { fields: Object.keys(remainingFields), transaction },
        );
    }

    async update(name, fields, transaction) {
        const { id, ...remainingFields } = fields;
        const Model = this.models[name];
        const instance = await Model.findByPk(id, { transaction });
        return instance.update(remainingFields, { transaction });
    }

    async createOrUpdate(name, fields, transaction) {
        if (typeof fields.id === 'undefined' || fields.id < 0) {
            return this.create(name, fields, transaction);
        }
        return this.update(name, fields, transaction);
    }

    async find(name, where, transaction) {
        const Model = this.models[name];
        return Model.findOne({ where, transaction });
    }

    async createOrFind(name, where, updateFields, transaction) {
        const Model = this.models[name];
        const instance = await Model.findOne({ where, transaction });
        if (!instance) {
            return this.create(name, { ...where, ...updateFields }, transaction);
        }
        return instance;
    }

    async delete(name, fields, transaction) {
        const Model = this.models[name];
        const { id } = fields;
        const instance = await Model.findByPk(id);
        return instance.destroy({ transaction });
    }

    async getNodesByEdge(edgeName, leftName, leftId, rightName, rightType, transaction) {
        const EdgeModel = this.models[edgeName];
        const edges = await EdgeModel.findAll({
            where: { [leftName]: leftId },
            transaction,
        });
        const NodeModel = this.models[rightType];
        const nodes = await Promise.all(
            edges.map((edge) => NodeModel.findByPk(edge[rightName]))
        );
        return nodes;
    }

    async setEdges(edgeName, leftName, leftId, rightName, right, transaction) {
        const Model = this.models[edgeName];
        const existingEdges = await Model.findAll({ where: { [leftName]: leftId } });
        const existingIDs = existingEdges.map((edge) => edge[rightName].toString());
        // Why specify fields? https://github.com/sequelize/sequelize/issues/11417
        const fields = [
            leftName,
            rightName,
            ...Object.keys(Object.values(right)[0] || {}),
        ];
        // eslint-disable-next-line no-unused-vars
        const [createdEdges, updatedEdges, deletedEdges] = await Promise.all([
            Promise.all(
                Object.keys(right)
                    .filter((rightId) => !existingIDs.includes(rightId))
                    .map((rightId) => Model.create({
                        [leftName]: leftId,
                        [rightName]: rightId,
                        ...right[rightId],
                    }, { fields, transaction })),
            ),
            Promise.all(
                existingEdges
                    .filter((edge) => edge[rightName] in right)
                    .map((edge) => edge.update(right[edge[rightName]], { transaction })),
            ),
            Promise.all(
                existingEdges
                    .filter((edge) => !(edge[rightName] in right))
                    .map((edge) => edge.destroy({ transaction })),
            ),
        ]);
        return [...createdEdges, ...updatedEdges];
    }

    async getAll(name, transaction) {
        const Model = this.models[name];
        return Model.findAll({ transaction });
    }
}

export default Database;
