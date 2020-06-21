
import LogKey from './LogKey';

class LogValue {
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
