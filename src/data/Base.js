/* eslint-disable no-undef */

import ValidationBase from './ValidationBase';

class Base extends ValidationBase {
    static createVirtual() {
        throw new Exception('not implemented');
    }

    static async list({ selector, ordering } = { selector: [] }) {
        const items = await this.database.findAll(this.DataType.name, selector, this.transaction);
        let outputItems = await Promise.all(
            items.map((item) => this.DataType.load.call(this, item.id)),
        );
        if (ordering) {
            outputItems = outputItems.sort((left, right) => {
                if (left.orderingIndex !== null && right.orderingIndex !== null) {
                    return left.orderingIndex - right.orderingIndex;
                } if (left.orderingIndex === null && right.orderingIndex !== null) {
                    return 1;
                } if (left.orderingIndex !== null && right.orderingIndex === null) {
                    return -1;
                }
                return left.id - right.id;
            });
        }
        return outputItems;
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
        const items = await Promise.all(input.map(
            (id, index) => this.database.update(
                this.DataType.name,
                { id, orderingIndex: index },
                this.transaction,
            ),
        ));
        return items.map((item) => item.id);
    }

    // eslint-disable-next-line no-unused-vars
    static async save(inputItem) {
        // returns ID of the newly created item
        throw new Exception('not implemented');
    }

    static async delete(id) {
        const item = await this.database.deleteByPk(
            this.DataType.name, id, this.transaction,
        );
        return { id: item.id };
    }
}

export default Base;
