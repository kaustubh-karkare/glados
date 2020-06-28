import assert from '../common/assert';
import range from '../common/range';
import {
    getDateValue,
    getDurationValue,
    getTodayValue,
    maybeSubstitute,
} from '../common/DateUtils';
import Base from './Base';
import LogReminderGroup, { LogReminderType } from './LogReminderGroup';
import { isRealItem } from './Utils';


const DefaultValues = {
    [LogReminderType.NONE]: {},
    [LogReminderType.UNSPECIFIED]: {},
    [LogReminderType.DEADLINE]: {
        deadline: '{tomorrow}',
        warning: '1 day',
    },
    [LogReminderType.PERIODIC]: {
        frequency: 'everyday',
        lastUpdate: '{today}',
    },
};

const DurationOptions = range(1, 8).map((value) => {
    const label = `${value.toString()} day${value > 1 ? 's' : ''}`;
    return { value: label, label };
});


const FrequencyOptions = [
    {
        value: 'everyday',
        label: 'Everyday',
        check: () => true,
    },
    {
        value: 'weekdays',
        label: 'Weekdays',
        check: () => [1, 2, 3, 4, 5].includes(new Date().getDay()),
    },
    {
        value: 'weekends',
        label: 'Weekends',
        check: () => [0, 6].includes(new Date().getDay()),
    },
    // TODO: Add more as needed.
];

const FrequencyCheck = FrequencyOptions.reduce((result, item) => {
    result[item.value] = item.check;
    return result;
}, {});


class LogReminder extends Base {
    static createVirtual({ logReminderGroup }) {
        const item = {
            logReminderGroup,
            ...DefaultValues[logReminderGroup.type],
        };
        maybeSubstitute(item, 'deadline');
        maybeSubstitute(item, 'lastUpdate');
        return item;
    }

    static getDurationOptions() {
        return DurationOptions;
    }

    static getFrequencyOptions() {
        return FrequencyOptions;
    }

    // eslint-disable-next-line consistent-return
    static check(reminderType, logReminder) {
        if (reminderType === LogReminderType.UNSPECIFIED) {
            return true;
        } if (reminderType === LogReminderType.DEADLINE) {
            return getTodayValue() >= getDateValue(logReminder.deadline)
                - getDurationValue(logReminder.warning);
        } if (reminderType === LogReminderType.PERIODIC) {
            return getTodayValue() > getDateValue(logReminder.last_update)
                ? FrequencyCheck[logReminder.frequency]()
                : false;
        }
        assert(false, reminderType);
    }

    static async validateInternal(inputLogReminder) {
        const results = [];
        if (inputLogReminder === null) {
            return [];
        }
        if (!isRealItem(inputLogReminder.logReminderGroup)) {
            results.push(['.logReminderGroup', false, 'is missing!']);
            return results;
        }
        const { type } = inputLogReminder.logReminderGroup;
        if (type === LogReminderType.UNSPECIFIED) {
            // no additional fields
        } else if (type === LogReminderType.DEADLINE) {
            results.push(this.validateDateLabel('.deadline', inputLogReminder.deadline));
            results.push(this.validateDuration('.warning', inputLogReminder.warning));
        } else if (type === LogReminderType.PERIODIC) {
            results.push(
                this.validateEnumValue('.frequency', inputLogReminder.frequency, FrequencyCheck),
            );
            results.push(this.validateDateLabel('.lastUpdate', inputLogReminder.lastUpdate));
        } else {
            results.push(['.type', false, ' is invalid!']);
        }
        return results;
    }

    static async load(id) {
        const logReminder = await this.database.findByPk('LogReminder', id, this.transaction);
        const outputLogReminderGroup = await LogReminderGroup.load.call(this, logReminder.group_id);
        return {
            logReminderGroup: outputLogReminderGroup,
            entry_id: logReminder.entry_id,
            deadline: logReminder.type === LogReminderType.DEADLINE
                ? logReminder.deadline
                : undefined,
            warning: logReminder.type === LogReminderType.DEADLINE
                ? logReminder.warning
                : undefined,
            frequency: logReminder.type === LogReminderType.PERIODIC
                ? logReminder.frequency
                : undefined,
            lastUpdate: logReminder.type === LogReminderType.PERIODIC
                ? logReminder.last_update
                : undefined,
        };
    }

    static async save(inputLogReminder) {
        const { type } = inputLogReminder.logReminderGroup;
        const fields = {
            id: inputLogReminder.id,
            group_id: inputLogReminder.logReminderGroup.id,
            entry_id: inputLogReminder.entry_id,
            type,
            deadline: type === LogReminderType.DEADLINE
                ? inputLogReminder.deadline
                : null,
            warning: type === LogReminderType.DEADLINE
                ? inputLogReminder.warning
                : null,
            frequency: type === LogReminderType.PERIODIC
                ? inputLogReminder.frequency
                : null,
            last_update: type === LogReminderType.PERIODIC
                ? inputLogReminder.lastUpdate
                : null,
        };
        const logReminder = await this.database.createOrUpdate(
            'LogReminder',
            fields,
            this.transaction,
        );
        return logReminder.id;
    }
}

LogReminder.Type = LogReminderType;

export default LogReminder;
