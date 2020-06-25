import assert from '../common/assert';
import deepcopy from '../common/deepcopy';
import range from '../common/range';
import {
    getDateValue,
    getDurationValue,
    getTodayValue,
    maybeSubstitute,
    validateDateLabel,
    validateDuration,
} from '../common/DateUtils';
import Base from './Base';

// Section: Enums.

const LogReminderTypeOptions = [
    {
        value: 'none',
        label: 'None',
        default: {},
    },
    {
        value: 'unspecified',
        label: 'Unspecified',
        default: {},
    },
    {
        value: 'deadline',
        label: 'Deadline',
        default: {
            deadline: '{tomorrow}',
            warning: '1 day',
        },
    },
    {
        value: 'periodic',
        label: 'Periodic',
        default: {
            frequency: 'everyday',
            lastUpdate: '{today}',
        },
    },
];

const LogReminderType = LogReminderTypeOptions.reduce((result, item) => {
    result[item.value.toUpperCase()] = item.value;
    return result;
}, {});


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

// Section: API

class LogReminder extends Base {
    static getTypeOptions() {
        const options = deepcopy(LogReminderTypeOptions);
        options.forEach((option) => {
            option.default.type = option.value;
        });
        maybeSubstitute(
            options.find((option) => option.value === LogReminderType.DEADLINE).default,
            'deadline',
        );
        maybeSubstitute(
            options.find((option) => option.value === LogReminderType.PERIODIC).default,
            'lastUpdate',
        );
        return options;
    }

    static getDurationOptions() {
        return DurationOptions;
    }

    static getFrequencyOptions() {
        return FrequencyOptions;
    }

    // eslint-disable-next-line consistent-return
    static check(value) {
        if (!value) {
            return false;
        } if (value.type === LogReminderType.UNSPECIFIED) {
            return true;
        } if (value.type === LogReminderType.DEADLINE) {
            return getTodayValue() >= getDateValue(value.deadline)
                - getDurationValue(value.warning);
        } if (value.type === LogReminderType.PERIODIC) {
            return getTodayValue() > getDateValue(value.lastUpdate)
                ? FrequencyCheck[value.frequency]()
                : false;
        }
        assert(false, value);
    }

    static async validateInternal(inputLogReminder) {
        if (inputLogReminder === null) {
            return [];
        }
        if (inputLogReminder.type === LogReminderType.NONE) {
            return ['.type', false, ' cannot be none!'];
        } if (inputLogReminder.type === LogReminderType.UNSPECIFIED) {
            return [];
        } if (inputLogReminder.type === LogReminderType.DEADLINE) {
            return [
                validateDateLabel('.deadline', inputLogReminder.deadline),
                validateDuration('.warning', inputLogReminder.warning),
            ];
        } if (inputLogReminder.type === LogReminderType.PERIODIC) {
            return [
                ['.frequency', FrequencyCheck[inputLogReminder.frequency], ' is unsupported!'],
                validateDateLabel('.lastUpdate', inputLogReminder.deadline),
            ];
        }
        return ['.type', false, ' is invalid!'];
    }

    static async load(id) {
        const logReminder = await this.database.findByPk('LogReminder', id, this.transaction);
        return {
            type: logReminder.type,
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
        const fields = {
            id: inputLogReminder.id,
            entry_id: inputLogReminder.entry_id,
            type: inputLogReminder.type,
            deadline: inputLogReminder.type === LogReminderType.DEADLINE
                ? inputLogReminder.deadline
                : null,
            warning: inputLogReminder.type === LogReminderType.DEADLINE
                ? inputLogReminder.warning
                : null,
            frequency: inputLogReminder.type === LogReminderType.PERIODIC
                ? inputLogReminder.frequency
                : null,
            last_update: inputLogReminder.type === LogReminderType.PERIODIC
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
