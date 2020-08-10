/* eslint-disable no-undef */

import assert from 'assert';
import { awaitSequence } from './Utils';
import ValidationBase from './ValidationBase';

function getDataType(name) {
    return name.split(/(?=[A-Z])/).map((word) => word.toLowerCase()).join('-');
}

class Base extends ValidationBase {
    static createVirtual() {
        throw new Exception('not implemented');
    }

    static async updateWhere(where = {}) {
        await awaitSequence(Object.keys(where), async (fieldName) => {
            // Special case! The topic_id filter is handled via junction tables,
            // unlike the remaining fields that can be queried normally.
            if (fieldName === 'topic_id') {
                const junctionTableName = `${this.DataType.name}ToLogTopic`;
                const junctionSourceName = {
                    LogTopic: 'source_topic_id',
                    LogStructure: 'source_structure_id',
                    LogEvent: 'source_event_id',
                }[this.DataType.name];
                assert(junctionSourceName);
                const edges = await this.database.getEdges(
                    junctionTableName,
                    'target_topic_id',
                    where.topic_id,
                );
                let ids;
                if (Array.isArray(where.topic_id)) {
                    // assuming AND operation, not OR
                    const counters = {};
                    edges.forEach((edge) => {
                        const id = edge[junctionSourceName];
                        counters[id] = (counters[id] || 0) + 1;
                    });
                    ids = Object.entries(counters)
                        .filter((pair) => pair[1] === where.topic_id.length)
                        .map((pair) => parseInt(pair[0], 10));
                } else {
                    ids = edges.map((edge) => edge[junctionSourceName]);
                }
                delete where.topic_id;
                assert(!where.id);
                where.id = { [this.database.Op.in]: ids };
            }
        });
    }

    static async list({ where, ordering } = {}) {
        await Base.updateWhere.call(this, where);
        let items = await this.database.findAll(this.DataType.name, where);
        if (ordering) {
            items = items.sort((left, right) => {
                if (left.ordering_index !== null && right.ordering_index !== null) {
                    return left.ordering_index - right.ordering_index;
                } if (left.ordering_index === null && right.ordering_index !== null) {
                    return 1;
                } if (left.ordering_index !== null && right.ordering_index === null) {
                    return -1;
                }
                return left.id - right.id;
            });
        }
        return Promise.all(
            items.map((item) => this.DataType.load.call(this, item.id)),
        );
    }

    // eslint-disable-next-line no-unused-vars
    static async typeahead({ query, where }) {
        const options = await this.database.findAll(
            this.DataType.name,
            { ...where, name: { [this.database.Op.like]: `${query}%` } },
        );
        const dataType = getDataType(this.DataType.name);
        return options.map((option) => ({
            __type__: dataType,
            id: option.id,
            name: option.name,
        })).sort((left, right) => left.name.localeCompare(right.name));
    }

    static async validateInternal() {
        return []; // not implemented
    }

    // eslint-disable-next-line no-unused-vars
    static async load(id) {
        throw new Exception('not implemented');
    }

    // eslint-disable-next-line no-unused-vars
    static async reorder(input) {
        // The client-side does not know the underscore names used in the database.
        // Is it possible to add a mysql index to prevent conflicts?
        const items = await Promise.all(input.ordering.map(
            (id, index) => this.database.update(
                this.DataType.name,
                { id, ordering_index: index },
            ),
        ));
        this.broadcast(`${input.dataType}-list`, { where: input.where });
        return items.map((item) => item.id);
    }

    // eslint-disable-next-line no-unused-vars
    static async save(inputItem) {
        // returns ID of the newly created item
        throw new Exception('not implemented');
    }

    static async getOrderingIndex(item, where = {}) {
        if (item) {
            return item.ordering_index;
        }
        return this.database.count(this.DataType.name, where, null);
    }

    static async broadcast(queryName, prevItem, fields) {
        if (!this.DataType) {
            return;
        }
        if (Array.isArray(fields)) {
            fields.forEach((fieldName) => {
                const prevValue = prevItem ? prevItem[fieldName] : null;
                this.broadcast(queryName, { where: { [fieldName]: prevValue } });
            });
        } else {
            Object.entries(fields).forEach(([fieldName, nextValue]) => {
                if (prevItem) {
                    const prevValue = prevItem[fieldName];
                    this.broadcast(queryName, { where: { [fieldName]: prevValue } });
                }
                this.broadcast(queryName, { where: { [fieldName]: nextValue } });
            });
        }
    }

    static async delete(id) {
        throw new Exception('not implemented');
    }
}

export default Base;
