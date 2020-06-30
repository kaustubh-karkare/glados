import Base from './Base';
import { getVirtualID } from './Utils';

const LogTagTypes = {
    person: {
        label: 'Person',
        trigger: '@',
    },
    hashtag: {
        label: 'Hashtag',
        trigger: '#',
    },
};

class LogTag extends Base {
    static createVirtual() {
        return {
            id: getVirtualID(),
            type: 'hashtag',
            name: '',
        };
    }

    static getTypes() {
        return Object.keys(LogTagTypes).map(
            (type) => ({ ...LogTagTypes[type], value: type }),
        );
    }

    static async validateInternal(inputLogTag) {
        return [
            this.validateNonEmptyString('.name', inputLogTag.name),
            this.validateEnumValue('.type', inputLogTag.type, LogTagTypes),
        ];
    }

    static async load(id) {
        const logTag = await this.database.findByPk('LogTag', id, this.transaction);
        return {
            id: logTag.id,
            type: logTag.type,
            name: logTag.name,
        };
    }

    static async save(inputLogTag) {
        const fields = {
            id: inputLogTag.id,
            type: inputLogTag.type,
            name: inputLogTag.name,
        };
        const logTag = await this.database.createOrUpdate(
            'LogTag', fields, this.transaction,
        );
        // TODO: Trigger consistency update if name change.
        this.broadcast('log-tag-list');
        return logTag.id;
    }
}

export default LogTag;
