import { getVirtualID } from './Utils';
import Base from './Base';

class LogStructureGroup extends Base {
    static createVirtual({
        logMode = null,
    }) {
        return {
            __type__: 'log-structure-group',
            id: getVirtualID(),
            logMode,
            name: '',
        };
    }

    static async updateWhere(where) {
        await Base.updateWhere.call(this, where, {
            id: 'id',
            logMode: 'mode_id',
        });
    }

    static async load(id) {
        const logStructureGroup = await this.database.findByPk('LogStructureGroup', id);
        const outputLogMode = await this.invoke.call(this, 'log-mode-load', { id: logStructureGroup.mode_id });
        return {
            __type__: 'log-structure-group',
            id: logStructureGroup.id,
            name: logStructureGroup.name,
            logMode: outputLogMode,
        };
    }

    static async save(inputLogStructureGroup) {
        const originalLogStructureGroup = await this.database.findItem(
            'LogStructureGroup',
            inputLogStructureGroup,
        );
        const orderingIndex = await Base.getOrderingIndex.call(this, originalLogStructureGroup);
        const fields = {
            mode_id: inputLogStructureGroup.logMode.id,
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
        await Promise.all(inputLogStructures.map(async (inputLogStructure) => {
            inputLogStructure.logMode = inputLogStructureGroup.logMode;
            return this.invoke.call(this, 'log-structure-upsert', inputLogStructure);
        }));
    }

    static async delete(id) {
        const logStructureGroup = await this.database.deleteByPk('LogStructureGroup', id);
        this.broadcast('log-structure-group-list');
        return { id: logStructureGroup.id };
    }
}

export default LogStructureGroup;
