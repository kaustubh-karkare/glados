
import Utils from './Utils';

const LogKeyTypes = {
    string: {
        label: 'String',
        validator: () => true,
    },
    integer: {
        label: 'Integer',
        validator: (data) => !!data.match(/^\d+$/),
    },
};

class LogKey {
    static getTypes() {
        return Object.keys(LogKeyTypes).map(
            (type) => ({ ...LogKeyTypes[type], value: type }),
        );
    }

    static createEmpty() {
        return {
            id: Utils.getNegativeID(),
            name: '',
            type: 'string',
        };
    }

    static async load(id) {
        const logKey = await this.database.findByPk('LogKey', id, this.transaction);
        return {
            id: logKey.id,
            name: logKey.name,
            type: logKey.type,
        };
    }
}

export default LogKey;
