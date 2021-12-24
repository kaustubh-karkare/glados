import { getVirtualID } from './Utils';
import Base from './Base';
import LogMode from './LogMode';

class LogStructureGroup extends Base {
    static createVirtual({
        logMode = null,
    }) {
        return {
            __type__: 'log-structure-group',
            __id__: getVirtualID(),
            logMode,
            name: '',
        };
    }

    static async updateWhere(where) {
        await Base.updateWhere.call(this, where, {
            __id__: 'id',
            logMode: 'mode_id',
        });
    }

    static async validateInternal(inputLogStructureGroup) {
        const results = [];

        if (inputLogStructureGroup.logMode) {
            const logModeResults = await Base.validateRecursive(
                LogMode, '.logMode', inputLogStructureGroup.logMode,
            );
            results.push(...logModeResults);
        }

        results.push(Base.validateNonEmptyString('.name', inputLogStructureGroup.name));

        return results;
    }

    static async load(id) {
        const logStructureGroup = await this.database.findByPk('LogStructureGroup', id);
        let outputLogMode = null;
        if (logStructureGroup.mode_id) {
            outputLogMode = await this.invoke.call(this, 'log-mode-load', { __id__: logStructureGroup.mode_id });
        }
        return {
            __type__: 'log-structure-group',
            __id__: logStructureGroup.id,
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
            mode_id: inputLogStructureGroup.logMode && inputLogStructureGroup.logMode.__id__,
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
        return { __id__: logStructureGroup.id };
    }
}

export default LogStructureGroup;
