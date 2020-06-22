
import LogKey from './LogKey';
import Utils from './Utils';

class LogValue {
    static createEmpty(logKey) {
        return {
            id: Utils.getNegativeID(),
            data: '',
            logKey: logKey || LogKey.createEmpty(),
        };
    }

    static async typeahead({ item }) {
        const logValues = await this.database.findAll(
            'LogValue',
            { key_id: item.logKey.id },
        );
        return logValues.map((logValue) => ({
            id: logValue.id,
            data: logValue.data,
            logKey: item.logKey,
        }));
    }

    static async load(id) {
        const logValue = await this.database.findByPk('LogValue', id, this.transaction);
        const outputLogKey = await LogKey.load.call(this, logValue.key_id);
        return {
            id: logValue.id,
            logKey: outputLogKey,
            data: logValue.data,
        };
    }
}

export default LogValue;
