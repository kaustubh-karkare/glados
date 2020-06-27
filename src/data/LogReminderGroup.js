import Base from './Base';
import { getVirtualID } from './Utils';

class LogReminderGroup extends Base {
    static createVirtual({ name } = {}) {
        return {
            id: getVirtualID(),
            name: name || '',
        };
    }

    static async typeahead() {
        const logReminderGroups = await this.database.findAll(
            'LogReminderGroup',
            {},
            this.transaction,
        );
        return logReminderGroups.map((logReminderGroup) => ({
            id: logReminderGroup.id,
            name: logReminderGroup.name,
        }));
    }

    static async validateInternal(inputLogReminderGroup) {
        return [
            this.validateNonEmptyString('.name', inputLogReminderGroup.name),
        ];
    }

    static async load(id) {
        const logReminderGroup = await this.database.findByPk(
            'LogReminderGroup',
            id,
            this.transaction,
        );
        return {
            id: logReminderGroup.id,
            name: logReminderGroup.name,
        };
    }

    static async save(inputLogReminderGroup) {
        const fields = {
            id: inputLogReminderGroup.id,
            name: inputLogReminderGroup.name,
        };
        const logReminderGroup = await this.database.createOrUpdate(
            'LogReminderGroup',
            fields,
            this.transaction,
        );
        return logReminderGroup.id;
    }
}

export default LogReminderGroup;
