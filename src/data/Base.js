/* eslint-disable no-undef */

import ValidationBase from './ValidationBase';

class Base extends ValidationBase {
    static createVirtual() {
        throw new Exception('not implemented');
    }

    static async list({ selector, ordering } = { selector: [] }) {
        let items = await this.database.findAll(this.DataType.name, selector, this.transaction);
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
    static async typeahead({ trigger, query, item }) {
        // trigger & query are provided by TextEditor.
        // item is provided by Typeahead.
        throw new Exception('not implemented');
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
        this.broadcast(`${input.dataType}-list`, { selector: input.selector });
        return items.map((item) => item.id);
    }

    // eslint-disable-next-line no-unused-vars
    static async save(inputItem) {
        // returns ID of the newly created item
        throw new Exception('not implemented');
    }

    static async getOrderingIndex(selector = {}) {
        return this.database.count(
            this.DataType.name,
            selector,
            null,
            this.transaction,
        );
    }

    static async delete(id) {
        const item = await this.database.deleteByPk(
            this.DataType.name, id, this.transaction,
        );
        return { id: item.id };
    }
}

export default Base;
