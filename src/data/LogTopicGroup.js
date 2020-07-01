import Base from './Base';
import { getVirtualID } from './Utils';

class LogTopicGroup extends Base {
    static createVirtual({ name } = {}) {
        return {
            id: getVirtualID(),
            name: name || '',
        };
    }

    static async validateInternal(inputLogTopicGroup) {
        return [
            this.validateNonEmptyString('.name', inputLogTopicGroup.name),
        ];
    }

    static async load(id) {
        const logTopicGroup = await this.database.findByPk(
            'LogTopicGroup',
            id,
            this.transaction,
        );
        return {
            id: logTopicGroup.id,
            name: logTopicGroup.name,
        };
    }

    static async save(inputLogTopicGroup) {
        let logTopicGroup = await this.database.findItem(
            'LogTopicGroup',
            inputLogTopicGroup,
            this.transaction,
        );
        const orderingIndex = await Base.getOrderingIndex.call(this, logTopicGroup);
        const fields = {
            ordering_index: orderingIndex,
            name: inputLogTopicGroup.name,
        };
        logTopicGroup = await this.database.createOrUpdateItem(
            'LogTopicGroup', logTopicGroup, fields, this.transaction,
        );
        this.broadcast('log-topic-group-list');
        return logTopicGroup.id;
    }
}

export default LogTopicGroup;
