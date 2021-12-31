import assert from 'assert';

import { asyncSequence } from '../AsyncUtils';
import DataTypeAPI from './api';
import { isItem } from './utils';

function getDataType(name) {
    return name.split(/(?=[A-Z])/).map((word) => word.toLowerCase()).join('-');
}

export default class DataTypeBase extends DataTypeAPI {
    static async getValidationErrors(inputItem) {
        const { DataType } = this;
        const result = await DataType.validate.call(this, inputItem);
        let prefix = DataType.name;
        prefix = prefix[0].toLowerCase() + prefix.substring(1);
        for (let jj = 0; jj < result.length; jj += 1) {
            result[jj][0] = prefix + result[jj][0];
        }
        return result
            .filter((item) => !item[1])
            .map((item) => `${item[0]} ${item[2]}`);
    }

    static async updateLogTopicsWhere(where) {
        // Special case! The logTopics filter is handled via junction tables,
        // unlike the remaining fields that can be queried normally.
        const junctionTableName = `${this.DataType.name}ToLogTopic`;
        const junctionSourceName = {
            LogTopic: 'source_topic_id',
            LogStructure: 'source_structure_id',
            LogEvent: 'source_event_id',
        }[this.DataType.name];
        assert(junctionSourceName);
        const logTopicIds = where.logTopics.map((item) => item.__id__);
        const edges = await this.database.getEdges(
            junctionTableName,
            'target_topic_id',
            logTopicIds,
        );
        let itemIds;
        if (logTopicIds.length > 1) {
            // assuming AND operation, not OR
            const counters = {};
            edges.forEach((edge) => {
                const id = edge[junctionSourceName];
                counters[id] = (counters[id] || 0) + 1;
            });
            itemIds = Object.entries(counters)
                .filter((pair) => pair[1] === logTopicIds.length)
                .map((pair) => parseInt(pair[0], 10));
        } else {
            itemIds = edges.map((edge) => edge[junctionSourceName]);
        }
        delete where.logTopics;
        assert(!where.id);
        where.id = itemIds;
    }

    static async updateWhere(where, mapping) {
        await asyncSequence(Object.keys(where), async (fieldName) => {
            if (fieldName === 'logTopics') {
                await DataTypeBase.updateLogTopicsWhere.call(this, where);
            } else if (fieldName in mapping) {
                const newFieldName = mapping[fieldName];
                let value = where[fieldName];
                value = isItem(value) ? value.__id__ : value;
                where[newFieldName] = value;
                if (fieldName !== newFieldName) {
                    delete where[fieldName];
                }
            } else {
                assert(false, `undefined where mapping: ${fieldName}`);
            }
        });
    }

    static trigger(item) {
        // Do nothing by default.
    }

    static async list(where, limit) {
        const order = [['ordering_index', 'DESC']];
        if (this.DataType.name === 'LogEvent') {
            order.unshift(['date', 'DESC']);
        }
        const items = await this.database.findAll(this.DataType.name, where, order, limit);
        return Promise.all(
            items.reverse().map((item) => this.DataType.load.call(this, item.id)),
        );
    }

    static async count(where) {
        return this.database.count(this.DataType.name, where);
    }

    // eslint-disable-next-line no-unused-vars
    static async typeahead({ query, where }) {
        if (
            {
                LogTopic: true,
                LogStructure: true,
            }[this.DataType.name]
        ) {
            where = { ...where, is_deprecated: false };
        }
        const options = await this.database.findAll(
            this.DataType.name,
            { ...where, name: { [this.database.Op.substring]: query } },
        );
        const dataType = getDataType(this.DataType.name);
        const items = options.map((option) => ({
            __type__: dataType,
            __id__: option.id,
            name: option.name,
        })).sort((left, right) => left.name.localeCompare(right.name));
        const first = [];
        const second = [];
        query = query.toLowerCase();
        items.forEach((item) => {
            if (item.name.toLowerCase().startsWith(query)) {
                first.push(item);
            } else {
                second.push(item);
            }
        });
        return [...first, ...second];
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
}
