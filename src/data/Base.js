/* eslint-disable no-undef */

import ValidationBase from './ValidationBase';

class Base extends ValidationBase {
    static createEmpty() {
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
}

export default Base;
