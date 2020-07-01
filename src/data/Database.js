import assert from '../common/assert';
import defineModels from './Models';
import { isRealItem } from './Utils';

const Sequelize = require('sequelize');

class Database {
    static async init(config) {
        const instance = new Database(config);
        return instance.sequelize.sync({ force: true }).then(() => instance);
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
            options.storage = config.storage;
        } else {
            assert(false, 'unknown database type');
        }
        this.sequelize = new Sequelize(
            config.name,
            config.username,
            config.password,
            options,
        );
        const nameAndModels = defineModels(this.sequelize);
        this._modelSequence = nameAndModels.map(([_name, model]) => model);
        this._models = nameAndModels.reduce((result, [name, model]) => {
            result[name] = model;
            return result;
        }, {});
        this.Op = Sequelize.Op;
    }

    async close() {
        await this.sequelize.close();
    }

    getModelSequence() {
        return this._modelSequence;
    }

    async build(name) {
        const Model = this._models[name];
        return Model.build({});
    }

    async create(name, fields, transaction) {
        const { id: _id, ...remainingFields } = fields;
        const Model = this._models[name];
        return Model.create(
            remainingFields,
            // Why specify fields? https://github.com/sequelize/sequelize/issues/11417
            { fields: Object.keys(remainingFields), transaction },
        );
    }

    async update(name, fields, transaction) {
        const { id, ...remainingFields } = fields;
        const Model = this._models[name];
        const instance = await Model.findByPk(id, { transaction });
        return instance.update(remainingFields, { transaction });
    }

    async createOrUpdateItem(name, item, fields, transaction) {
        if (item) {
            return item.update(fields, { transaction });
        }
        return this.create(name, fields, transaction);
    }

    async findAll(name, where, transaction) {
        const Model = this._models[name];
        return Model.findAll({ where, transaction });
    }

    async findOne(name, where, transaction) {
        const Model = this._models[name];
        return Model.findOne({ where, transaction });
    }

    async findByPk(name, id, transaction) {
        const Model = this._models[name];
        return Model.findByPk(id, { transaction });
    }

    async findItem(name, item, transaction) {
        if (isRealItem(item)) {
            return this.findByPk(name, item.id, transaction);
        }
        return null;
    }

    async count(name, where, group, transaction) {
        const Model = this._models[name];
        return Model.count({ where, group, transaction });
    }

    async createOrFind(name, where, updateFields, transaction) {
        const Model = this._models[name];
        const instance = await Model.findOne({ where, transaction });
        if (!instance) {
            return this.create(name, { ...where, ...updateFields }, transaction);
        }
        return instance;
    }

    async deleteAll(name, where, transaction) {
        const Model = this._models[name];
        return Model.destroy({ where, transaction });
    }

    async deleteByPk(name, id, transaction) {
        const Model = this._models[name];
        const instance = await Model.findByPk(id);
        return instance.destroy({ transaction });
    }

    async getEdges(edgeName, leftName, leftId, transaction) {
        const EdgeModel = this._models[edgeName];
        const edges = await EdgeModel.findAll({
            where: { [leftName]: leftId },
            transaction,
        });
        if (edges.length > 1 && typeof edges[0].ordering_index !== 'undefined') {
            edges.sort((left, right) => left.ordering_index - right.ordering_index);
        }
        return edges;
    }

    async getNodesByEdge(edgeName, leftName, leftId, rightName, rightType, transaction) {
        const edges = await this.getEdges(edgeName, leftName, leftId, transaction);
        const NodeModel = this._models[rightType];
        const nodes = await Promise.all(
            edges.map((edge) => NodeModel.findByPk(edge[rightName]), { transaction }),
        );
        return nodes;
    }

    async setEdges(edgeName, leftName, leftId, rightName, right, transaction) {
        const Model = this._models[edgeName];
        const existingEdges = await Model.findAll({ where: { [leftName]: leftId } });
        const existingIDs = existingEdges.map((edge) => edge[rightName].toString());
        // Why specify fields? https://github.com/sequelize/sequelize/issues/11417
        const fields = [
            leftName,
            rightName,
            ...Object.keys(Object.values(right)[0] || {}),
        ];
        // eslint-disable-next-line no-unused-vars
        const [updatedEdges, deletedEdges] = await Promise.all([
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
        // eslint-disable-next-line no-unused-vars
        const createdEdges = await Promise.all(
            Object.keys(right)
                .filter((rightId) => !existingIDs.includes(rightId))
                .map((rightId) => Model.create({
                    [leftName]: leftId,
                    [rightName]: rightId,
                    ...right[rightId],
                }, { fields, transaction })),
        );
        return deletedEdges;
    }
}

export default Database;
