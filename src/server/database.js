import assert from 'assert';
import fs from 'fs';

import { isRealItem } from '../common/data_types';
import { getDataModels } from './models';

const Sequelize = require('sequelize');

export default class {
    constructor(config) {
        this.config = config;
        this.sequelize = new Sequelize(this.config);
        const nameAndModels = getDataModels(this.sequelize);
        this._modelSequence = nameAndModels.map(([_name, model]) => model);
        this._models = nameAndModels.reduce((result, [name, model]) => {
            result[name] = model;
            return result;
        }, {});
        this.Op = Sequelize.Op;
        this.transaction = null;
    }

    getTransaction() {
        // The this.transaction field is set by the Actions class.
        // By creating a new object with the database instance as a prototype,
        // we have the transaction available in context, and API remains simple.
        assert(!!this.transaction);
        return this.transaction;
    }

    async reset() {
        // You cant invoke sync during an active transaction!
        await this.transaction.commit();
        if (fs.existsSync(this.sequelize.options.storage)) {
            fs.unlinkSync(this.sequelize.options.storage);
        }
        if (this.config.dialect === 'sqlite') {
            // https://github.com/sequelize/sequelize/issues/11583
            await this.sequelize.query('PRAGMA foreign_keys = false;');
            await this.sequelize.sync({ force: true });
            await this.sequelize.query('PRAGMA foreign_keys = true;');
        } else {
            await this.sequelize.sync({ force: true });
        }
        this.transaction = await this.sequelize.transaction();
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

    async create(name, fields) {
        const transaction = this.getTransaction();
        const { __id__: _id, ...remainingFields } = fields;
        const Model = this._models[name];
        return Model.create(
            remainingFields,
            // Why specify fields? https://github.com/sequelize/sequelize/issues/11417
            { fields: Object.keys(remainingFields), transaction },
        );
    }

    async update(name, fields) {
        const transaction = this.getTransaction();
        const { id, ...remainingFields } = fields;
        const Model = this._models[name];
        const instance = await Model.findByPk(id, { transaction });
        return instance.update(remainingFields, { transaction });
    }

    async createOrUpdateItem(name, item, fields) {
        const transaction = this.getTransaction();
        if (item) {
            return item.update(fields, { transaction });
        }
        return this.create(name, fields);
    }

    async findAll(name, where, order, limit) {
        const transaction = this.getTransaction();
        const Model = this._models[name];
        return Model.findAll({
            where, order, limit, transaction,
        });
    }

    async findOne(name, where, order) {
        const transaction = this.getTransaction();
        const Model = this._models[name];
        return Model.findOne({ where, order, transaction });
    }

    async findByPk(name, id) {
        const transaction = this.getTransaction();
        const Model = this._models[name];
        return Model.findByPk(id, { transaction });
    }

    async findItem(name, item) {
        if (isRealItem(item)) {
            return this.findByPk(name, item.__id__);
        }
        return null;
    }

    async count(name, where, group) {
        const transaction = this.getTransaction();
        const Model = this._models[name];
        return Model.count({ where, group, transaction });
    }

    async createOrFind(name, where, updateFields) {
        const transaction = this.getTransaction();
        const Model = this._models[name];
        const instance = await Model.findOne({ where, transaction });
        if (!instance) {
            return this.create(name, { ...where, ...updateFields });
        }
        return instance;
    }

    async deleteAll(name, where) {
        const transaction = this.getTransaction();
        const Model = this._models[name];
        return Model.destroy({ where, transaction });
    }

    async deleteByPk(name, id) {
        const transaction = this.getTransaction();
        const Model = this._models[name];
        const instance = await Model.findByPk(id);
        return instance.destroy({ transaction });
    }

    async getEdges(edgeName, leftName, leftId) {
        const transaction = this.getTransaction();
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

    async getNodesByEdge(edgeName, leftName, leftId, rightName, rightType) {
        const transaction = this.getTransaction();
        const edges = await this.getEdges(edgeName, leftName, leftId);
        const NodeModel = this._models[rightType];
        const nodes = await Promise.all(
            edges.map((edge) => NodeModel.findByPk(edge[rightName]), { transaction }),
        );
        return nodes;
    }

    async setEdges(edgeName, leftName, leftId, rightName, right) {
        const transaction = this.getTransaction();
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
