import Base from './Base';
import LogKey from './LogKey';
import { getVirtualID } from './Utils';

class LogValue extends Base {
    static createVirtual({ logKey, data } = {}) {
        return {
            id: getVirtualID(),
            data: data || '',
            logKey: logKey || LogKey.createVirtual(),
        };
    }

    static async typeahead({ item }) {
        const logValues = await this.database.findAll('LogValue', {}, this.transaction);
        return logValues.map((logValue) => ({
            id: logValue.id,
            data: logValue.data,
            logKey: item.logKey,
        }));
    }

    static async validateInternal(inputValue) {
        const logKeyResults = await this.validateRecursive(
            LogKey,
            '.logKey',
            inputValue.logKey,
        );
        return [
            ...logKeyResults,
            this.validateUsingLambda(
                '.data',
                inputValue.data,
                LogKey.OptionsMap[inputValue.logKey.type].validator,
            ),
        ];
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
