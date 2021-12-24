import { getVirtualID } from './Utils';
import Base from './Base';

class LogMode extends Base {
    static createVirtual({ name = '' } = {}) {
        return {
            __type__: 'log-mode',
            __id__: getVirtualID(),
            name,
        };
    }

    static async updateWhere(where) {
        await Base.updateWhere.call(this, where, {
            __id__: 'id',
        });
    }

    static async validateInternal(inputLogMode) {
        const results = [];
        results.push(Base.validateNonEmptyString('.name', inputLogMode.name));
        return results;
    }

    static async load(id) {
        const logMode = await this.database.findByPk('LogMode', id);
        return {
            __type__: 'log-mode',
            __id__: logMode.id,
            name: logMode.name,
        };
    }

    static async save(inputLogMode) {
        let logMode = await this.database.findItem('LogMode', inputLogMode);
        const orderingIndex = await Base.getOrderingIndex.call(this, logMode);
        const fields = {
            ordering_index: orderingIndex,
            name: inputLogMode.name,
        };
        logMode = await this.database.createOrUpdateItem('LogMode', logMode, fields);
        this.broadcast('log-mode-list');
        return logMode.id;
    }

    static async delete(id) {
        const logMode = await this.database.deleteByPk('LogMode', id);
        this.broadcast('log-mode-list');
        return { __id__: logMode.id };
    }
}

export default LogMode;
