/* eslint-disable no-undef */

import ValidationBase from './ValidationBase';

function getDataType(name) {
    return name.split(/(?=[A-Z])/).map((word) => word.toLowerCase()).join('-');
}

class Base extends ValidationBase {
    static createVirtual() {
        throw new Exception('not implemented');
    }

    static async list({ where, ordering } = { where: {} }) {
        let items = await this.database.findAll(this.DataType.name, where, this.transaction);
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
            this.transaction,
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
                this.transaction,
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

    static async manageEntityBefore(inputSubItem, DataType) {
        if (inputSubItem) {
            // Condition? add, edit

            // Warning! Having to change context here is an abstraction leak!
            return DataType.save.call({ ...this, DataType }, inputSubItem);
        }
        return null;
    }

    static async manageEntityAfter(prevItemId, inputSubItem, DataType) {
        if (prevItemId && !inputSubItem) {
            // Condition? delete

            // Warning! Having to change context here is an abstraction leak!
            await DataType.delete.call({ ...this, DataType }, prevItemId);
        }
    }

    static async getOrderingIndex(item, where = {}) {
        if (item) {
            return item.ordering_index;
        }
        return this.database.count(
            this.DataType.name,
            where,
            null,
            this.transaction,
        );
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
