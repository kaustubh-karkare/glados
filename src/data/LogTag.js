
import Utils from './Utils';

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

    static async typeahead({ trigger, query }) {
        const logTagType = LogTag.getTypes().find((item) => item.trigger === trigger);
        const where = {
            type: logTagType.value,
            name: { [this.database.Op.like]: `${query}%` },
        };
        const logTags = await this.database.findAll('LogTag', where, this.transaction);
        return logTags.map((logTag) => ({
            id: logTag.id,
            name: logTag.name,
        }));
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
