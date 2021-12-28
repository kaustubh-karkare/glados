export default class DataTypeAPI {
    // The process of adding a new data type should be consistent.

    static createVirtual() { // create
        // Usage? Client.
        // Used by the client when it wants to create a new object of this type.
        throw new Error('not implemented');
    }

    static trigger(_item) { // update
        // Usage? Client & Server.
        // Invoked whenever the object is updated by any user action.
        throw new Error('not implemented');
    }

    static async validate(_item) {
        // Usage? Client & Server.
        // Take the canonical representation and return a list of violations.
        throw new Error('not implemented');
    }

    static async where(_fields) { // filter, search
        // Usage? Server.
        // Translate a client-side query into a valid database query.
        throw new Error('not implemented');
    }

    static async load(_id) {
        // Usage? Server.
        // Load the object from the database, and build the canonical representation.
        throw new Error('not implemented');
    }

    static async save(_item) {
        // Usage? Server.
        // Take the canonical representation and write it to the database.
        throw new Error('not implemented');
    }

    static async delete(_id) {
        // Usage? Server.
        // Delete the specified object from the database.
        throw new Error('not implemented');
    }
}
