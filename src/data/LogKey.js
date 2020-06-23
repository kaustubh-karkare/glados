import Base from './Base';
import { getVirtualID } from './Utils';

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

class LogKey extends Base {
    static getTypes() {
        return Object.keys(LogKeyTypes).map(
            (type) => ({ ...LogKeyTypes[type], value: type }),
        );
    }

    static getValidator(value) {
        if (value in LogKeyTypes) {
            return LogKeyTypes[value].validator;
        }
        return null;
    }

    static createVirtual(name) {
        return {
            id: getVirtualID(),
            name: name || '',
            type: 'string',
        };
    }

    static async typeahead() {
        const logKeys = await this.database.findAll('LogKey', {}, this.transaction);
        return logKeys.map((logKey) => ({
            id: logKey.id,
            name: logKey.name,
            type: logKey.type,
        }));
    }

    static async validateInternal(inputLogKey) {
        return [
            this.validateNonEmptyString('.name', inputLogKey.name),
            this.validateEnumValue('.type', inputLogKey.type, LogKeyTypes),
        ];
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
