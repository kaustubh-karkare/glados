/* eslint-disable no-undef */

import ValidationBase from './ValidationBase';
import { INCOMPLETE_KEY } from './Utils';

class Base extends ValidationBase {
    static createVirtual() {
        throw new Exception('not implemented');
    }

    static async list({ selector, ordering } = { selector: {} }) {
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
    static async typeahead({ query }) {
        const options = await this.database.findAll(
            this.DataType.name,
            { name: { [this.database.Op.like]: `${query}%` } },
            this.transaction,
        );
        return options.map((option) => ({
            __type__: this.DataType.name
                .split(/(?=[A-Z])/).map((word) => word.toLowerCase()).join('-'),
            id: option.id,
            name: option.name,
            [INCOMPLETE_KEY]: true,
        }));
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

    static async getOrderingIndex(item, selector = {}) {
        if (item) {
            return item.ordering_index;
        }
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
