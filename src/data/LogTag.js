
import Utils from './Utils';

const LogTagTypes = {
    person: {
        label: 'Person',
        trigger: '@',
        prefix: '',
    },
    hashtag: {
        label: 'Hashtag',
        trigger: '#',
        prefix: '#',
    },
};

class LogTag {
    static createEmpty() {
        return {
            id: Utils.getNegativeID(),
            type: 'hashtag',
            name: '',
        };
    }

    static getTypes() {
        return Object.keys(LogTagTypes).map(
            (type) => ({ ...LogTagTypes[type], value: type }),
        );
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
        return logTag.id;
    }
}

export default LogTag;
