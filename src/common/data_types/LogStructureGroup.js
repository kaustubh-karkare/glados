import DataTypeBase from './base';
import { getVirtualID } from './utils';
import { validateNonEmptyString } from './validation';

class LogStructureGroup extends DataTypeBase {
    static createVirtual() {
        return {
            __type__: 'log-structure-group',
            __id__: getVirtualID(),
            name: '',
        };
    }

    static async updateWhere(where) {
        await DataTypeBase.updateWhere.call(this, where, {
            __id__: 'id',
        });
    }

    static async validate(inputLogStructureGroup) {
        const results = [];

        results.push(validateNonEmptyString('.name', inputLogStructureGroup.name));

        return results;
    }

    static async load(id) {
        const logStructureGroup = await this.database.findByPk('LogStructureGroup', id);
        return {
            __type__: 'log-structure-group',
            __id__: logStructureGroup.id,
            name: logStructureGroup.name,
        };
    }

    static async save(inputLogStructureGroup) {
        const originalLogStructureGroup = await this.database.findItem(
            'LogStructureGroup',
            inputLogStructureGroup,
        );
        const orderingIndex = await DataTypeBase.getOrderingIndex.call(
            this,
            originalLogStructureGroup,
        );
        const fields = {
            ordering_index: orderingIndex,
            name: inputLogStructureGroup.name,
        };
        const updatedLogStructureGroup = await this.database.createOrUpdateItem(
            'LogStructureGroup', originalLogStructureGroup, fields,
        );
        if (originalLogStructureGroup) {
            await LogStructureGroup.updateLogStructures.call(this, inputLogStructureGroup);
        }
        this.broadcast('log-structure-group-list');
        return updatedLogStructureGroup.id;
    }

    static async updateLogStructures(inputLogStructureGroup) {
        const inputLogStructures = await this.invoke.call(
            this,
            'log-structure-list',
            { where: { logStructureGroup: inputLogStructureGroup } },
        );
        await Promise.all(inputLogStructures.map(
            async (inputLogStructure) => this.invoke.call(this, 'log-structure-upsert', inputLogStructure),
        ));
    }

    static async delete(id) {
        const logStructureGroup = await this.database.deleteByPk('LogStructureGroup', id);
        this.broadcast('log-structure-group-list');
        return { __id__: logStructureGroup.id };
    }
}

export default LogStructureGroup;
