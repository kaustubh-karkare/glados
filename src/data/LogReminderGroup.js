import Base from './Base';
import { getVirtualID } from './Utils';
import Enum from '../common/Enum';

const [ReminderOptions, ReminderType] = Enum([
    {
        value: 'unspecified',
        label: 'Unspecified',
    },
    {
        value: 'deadline',
        label: 'Deadline',
    },
    {
        value: 'periodic',
        label: 'Periodic',
    },
]);

class LogReminderGroup extends Base {
    static createVirtual({ name, type } = {}) {
        return {
            __type__: 'log-reminder-group',
            id: getVirtualID(),
            name: name || '',
            type: type || ReminderType.UNSPECIFIED,
            onSidebar: true,
        };
    }

    static async validateInternal(inputLogReminderGroup) {
        return [
            this.validateNonEmptyString('.name', inputLogReminderGroup.name),
            this.validateEnumValue('.type', inputLogReminderGroup.type.toUpperCase(), ReminderType),
        ];
    }

    static async load(id) {
        const logReminderGroup = await this.database.findByPk(
            'LogReminderGroup',
            id,
            this.transaction,
        );
        return {
            __type__: 'log-reminder-group',
            id: logReminderGroup.id,
            name: logReminderGroup.name,
            type: logReminderGroup.type,
            onSidebar: logReminderGroup.on_sidebar,
        };
    }

    static async save(inputLogReminderGroup) {
        let logReminderGroup = await this.database.findItem(
            'LogReminderGroup',
            inputLogReminderGroup,
            this.transaction,
        );
        const orderingIndex = await Base.getOrderingIndex.call(this, logReminderGroup);
        const fields = {
            ordering_index: orderingIndex,
            name: inputLogReminderGroup.name,
            type: inputLogReminderGroup.type,
            on_sidebar: inputLogReminderGroup.onSidebar,
        };
        logReminderGroup = await this.database.createOrUpdateItem(
            'LogReminderGroup', logReminderGroup, fields, this.transaction,
        );
        this.broadcast('log-reminder-group-list');
        return logReminderGroup.id;
    }
}

LogReminderGroup.ReminderOptions = ReminderOptions;
LogReminderGroup.ReminderType = ReminderType;

export default LogReminderGroup;
