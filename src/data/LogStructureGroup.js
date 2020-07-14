import { getVirtualID } from './Utils';
import Base from './Base';

class LogStructureGroup extends Base {
    static createVirtual() {
        return {
            __type__: 'log-structure-group',
            id: getVirtualID(),
            name: '',
        };
    }

    static async load(id) {
        const logStructureGroup = await this.database.findByPk('LogStructureGroup', id, this.transaction);
        return {
            __type__: 'log-structure-group',
            id: logStructureGroup.id,
            name: logStructureGroup.name,
        };
    }

    static async save(inputLogStructureGroup) {
        let logStructureGroup = await this.database.findItem(
            'LogStructureGroup',
            inputLogStructureGroup,
            this.transaction,
        );
        const orderingIndex = await Base.getOrderingIndex.call(this, logStructureGroup);
        const fields = {
            ordering_index: orderingIndex,
            name: inputLogStructureGroup.name,
        };
        logStructureGroup = await this.database.createOrUpdateItem(
            'LogStructureGroup', logStructureGroup, fields, this.transaction,
        );
        this.broadcast('log-structure-group-list');
        return logStructureGroup.id;
    }
}

export default LogStructureGroup;
