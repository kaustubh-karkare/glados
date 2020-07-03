import Base from './Base';
import { getVirtualID } from './Utils';
import Enum from '../common/Enum';

const [Options, Type, OptionsMap] = Enum([
    {
        value: 'string',
        label: 'String',
        validator: () => true,
    },
    {
        value: 'integer',
        label: 'Integer',
        validator: (data) => !!data.match(/^\d+$/),
    },
]);

class LogKey extends Base {
    static createVirtual({ name } = {}) {
        return {
            __type__: 'log-key',
            id: getVirtualID(),
            name: name || '',
            type: 'string',
        };
    }

    static async validateInternal(inputLogKey) {
        return [
            this.validateNonEmptyString('.name', inputLogKey.name),
            this.validateEnumValue('.type', inputLogKey.type, OptionsMap),
        ];
    }

    static async load(id) {
        const logKey = await this.database.findByPk('LogKey', id, this.transaction);
        return {
            __type__: 'log-key',
            id: logKey.id,
            name: logKey.name,
            type: logKey.type,
        };
    }
}

LogKey.Options = Options;
LogKey.Type = Type;
LogKey.OptionsMap = OptionsMap;

export default LogKey;
