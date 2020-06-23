/* eslint-disable no-undef */

import ValidationBase from './ValidationBase';

class Base extends ValidationBase {
    static createVirtual() {
        throw new Exception('not implemented');
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
