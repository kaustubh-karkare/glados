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
import LogStructure from './LogStructure';
import { getVirtualID, isRealItem } from './Utils';


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

const DurationOptions = range(1, 31).map((value) => {
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
            id: getVirtualID(),
            logReminderGroup,
            ...DefaultValues[logReminderGroup.type],
            needsEdit: true,
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
    static check(logReminder) {
        // input = after loading
        if (logReminder.type === LogReminderType.UNSPECIFIED) {
            return true;
        } if (logReminder.type === LogReminderType.DEADLINE) {
            return getTodayValue() >= getDateValue(logReminder.deadline)
                - getDurationValue(logReminder.warning);
        } if (logReminder.type === LogReminderType.PERIODIC) {
            return getTodayValue() > getDateValue(logReminder.lastUpdate)
                ? FrequencyCheck[logReminder.frequency]()
                : false;
        }
        assert(false, logReminder.dataValues);
    }

    static async list(input = {}) {
        const { isActive, ...moreInput } = input;
        let outputLogReminders = await Base.list.call(this, moreInput);
        if (isActive) {
            outputLogReminders = outputLogReminders.filter(
                (outputLogReminder) => LogReminder.check.call(this, outputLogReminder),
            );
        }
        return outputLogReminders;
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

            if (isRealItem((inputLogReminder.logStructure))) {
                const logStructureResults = await this.validateRecursive(
                    LogStructure, '.logStructure', inputLogReminder.logStructure,
                );
                results.push(...logStructureResults);
            } else {
                results.push(['.logStructure', false, 'is required for periodic reminders!']);
            }
        } else {
            results.push(['.type', false, ' is invalid!']);
        }
        return results;
    }

    static async load(id) {
        const logReminder = await this.database.findByPk('LogReminder', id, this.transaction);
        const outputLogReminderGroup = await LogReminderGroup.load.call(this, logReminder.group_id);
        let outputLogStructure = null;
        if (logReminder.structure_id) {
            outputLogStructure = await LogStructure.load.call(this, logReminder.structure_id);
        }
        return {
            id: logReminder.id,
            title: logReminder.title,
            logStructure: outputLogStructure,
            logReminderGroup: outputLogReminderGroup,
            type: logReminder.type,
            deadline: logReminder.deadline,
            warning: logReminder.warning,
            frequency: logReminder.frequency,
            lastUpdate: logReminder.last_update,
            needsEdit: logReminder.needs_edit,
        };
    }

    static async save(inputLogReminder) {
        const structureId = isRealItem(inputLogReminder.logStructure)
            ? inputLogReminder.logStructure.id
            : null;
        assert(isRealItem(inputLogReminder.logReminderGroup));
        const orderingIndex = await Base.getOrderingIndex.call(this, {
            group_id: inputLogReminder.logReminderGroup.id,
        });
        const fields = {
            id: inputLogReminder.id,
            title: inputLogReminder.title,
            structure_id: structureId,
            group_id: inputLogReminder.logReminderGroup.id,
            ordering_index: orderingIndex,
            type: inputLogReminder.type,
            deadline: inputLogReminder.deadline,
            warning: inputLogReminder.warning,
            frequency: inputLogReminder.frequency,
            last_update: inputLogReminder.lastUpdate,
            needs_edit: inputLogReminder.needsEdit,
        };
        const logReminder = await this.database.createOrUpdate(
            'LogReminder',
            fields,
            this.transaction,
        );
        this.broadcast('log-reminder-list');
        return logReminder.id;
    }
}

LogReminder.Type = LogReminderType;

export default LogReminder;
