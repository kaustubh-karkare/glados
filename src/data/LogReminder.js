import assert from '../common/assert';
import range from '../common/range';
import {
    DaysOfTheWeek,
    getDateValue,
    getDurationValue,
    getTodayValue,
    getTodayDay,
    maybeSubstitute,
} from '../common/DateUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import Base from './Base';
import LogTopic from './LogTopic';
import LogStructure from './LogStructure';
import { getVirtualID, isRealItem } from './Utils';
import Enum from '../common/Enum';


const [ReminderOptions, ReminderType] = Enum([
    {
        value: 'unspecified',
        label: 'Unspecified',
        default: {
            deadline: null,
            warning: null,
            frequency: null,
            lastUpdate: null,
        },
    },
    {
        value: 'deadline',
        label: 'Deadline',
        default: {
            deadline: '{tomorrow}',
            warning: '1 day',
            frequency: null,
            lastUpdate: null,
        },
    },
    {
        value: 'periodic',
        label: 'Periodic',
        default: {
            deadline: null,
            warning: null,
            frequency: 'everyday',
            lastUpdate: '{today}',
        },
    },
]);

const FrequencyRawOptions = [
    {
        value: 'everyday',
        label: 'Everyday',
        check: () => true,
    },
    {
        value: 'weekdays',
        label: 'Weekdays',
        check: () => [1, 2, 3, 4, 5].includes(getTodayDay()),
    },
    {
        value: 'weekends',
        label: 'Weekends',
        check: () => [0, 6].includes(getTodayDay()),
    },
    // TODO: Add more as needed.
];

DaysOfTheWeek.forEach((day, index) => {
    FrequencyRawOptions.push({
        value: day.toLowerCase(),
        label: day,
        check: () => (getTodayDay() === index),
    });
});

const [FrequencyOptions, _FrequencyType, FrequencyOptionsMap] = Enum(FrequencyRawOptions);

const DurationOptions = range(1, 31).map((value) => {
    const label = `${value.toString()} day${value > 1 ? 's' : ''}`;
    return { value: label, label };
});


class LogReminder extends Base {
    static createVirtual({ title, parentLogTopic }) {
        const item = {
            id: getVirtualID(),
            title: title || '',
            isMajor: true,
            parentLogTopic,
            type: ReminderType.UNSPECIFIED,
            needsEdit: true,
            logStructure: null,
        };
        maybeSubstitute(item, 'deadline');
        maybeSubstitute(item, 'lastUpdate');
        return item;
    }

    static trigger(logReminder) {
        if (logReminder.logStructure) {
            logReminder.title = TextEditorUtils.serialize(
                logReminder.logStructure.name,
                TextEditorUtils.StorageType.PLAINTEXT,
            );
        }
    }

    // eslint-disable-next-line consistent-return
    static check(logReminder) {
        // input = after loading
        if (logReminder.type === ReminderType.UNSPECIFIED) {
            return true;
        } if (logReminder.type === ReminderType.DEADLINE) {
            return getTodayValue() >= getDateValue(logReminder.deadline)
                - getDurationValue(logReminder.warning);
        } if (logReminder.type === ReminderType.PERIODIC) {
            return getTodayValue() > getDateValue(logReminder.lastUpdate)
                ? FrequencyOptionsMap[logReminder.frequency].check()
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

        const parentLogTopicResults = await this.validateRecursive(
            LogTopic, '.parentLogTopic', inputLogReminder.parentLogTopic,
        );
        results.push(...parentLogTopicResults);

        results.push(this.validateNonEmptyString('.title', inputLogReminder.title));

        const { type } = inputLogReminder;
        if (type === ReminderType.UNSPECIFIED) {
            // no additional fields
        } else if (type === ReminderType.DEADLINE) {
            results.push(this.validateDateLabel('.deadline', inputLogReminder.deadline));
            results.push(this.validateDuration('.warning', inputLogReminder.warning));
        } else if (type === ReminderType.PERIODIC) {
            results.push(
                this.validateEnumValue(
                    '.frequency',
                    inputLogReminder.frequency,
                    FrequencyOptionsMap,
                ),
            );
            results.push(this.validateDateLabel('.lastUpdate', inputLogReminder.lastUpdate));
        } else {
            results.push(['.type', false, ' is invalid!']);
        }
        return results;
    }

    static async load(id) {
        const logReminder = await this.database.findByPk('LogReminder', id, this.transaction);
        const outputParentLogTopic = await LogTopic.load.call(this, logReminder.parent_topic_id);
        let outputLogStructure = null;
        if (logReminder.structure_id) {
            outputLogStructure = await LogStructure.load.call(this, logReminder.structure_id);
        }
        return {
            id: logReminder.id,
            title: logReminder.title,
            isMajor: logReminder.is_major,
            logStructure: outputLogStructure,
            parentLogTopic: outputParentLogTopic,
            type: logReminder.type,
            deadline: logReminder.deadline,
            warning: logReminder.warning,
            frequency: logReminder.frequency,
            lastUpdate: logReminder.last_update,
            needsEdit: logReminder.needs_edit,
        };
    }

    static async save(inputLogReminder) {
        let logReminder = await this.database.findItem(
            'LogReminder',
            inputLogReminder,
            this.transaction,
        );

        const prevLogTopicId = logReminder && logReminder.parent_topic_id;
        const nextLogTopicId = await Base.manageEntityBefore.call(
            this, inputLogReminder.parentLogTopic, LogTopic,
        );

        assert(isRealItem(inputLogReminder.parentLogTopic));
        const orderingIndex = await Base.getOrderingIndex.call(this, logReminder, {
            parent_topic_id: nextLogTopicId,
        });
        const fields = {
            title: inputLogReminder.title,
            parent_topic_id: nextLogTopicId,
            ordering_index: orderingIndex,
            type: inputLogReminder.type,
            deadline: inputLogReminder.deadline,
            warning: inputLogReminder.warning,
            frequency: inputLogReminder.frequency,
            last_update: inputLogReminder.lastUpdate,
            needs_edit: inputLogReminder.needsEdit,
        };
        logReminder = await this.database.createOrUpdateItem(
            'LogReminder', logReminder, fields, this.transaction,
        );

        await Base.manageEntityAfter.call(
            this, prevLogTopicId, inputLogReminder.parentLogTopic, LogTopic,
        );

        this.broadcast('log-reminder-list');
        return logReminder.id;
    }

    static async delete(id) {
        const logReminder = await this.database.findByPk('LogReminder', id, this.transaction);
        const result = await Base.delete.call(this, logReminder.id);
        // TODO: Disassociate structure instead of deleteing it!
        await Base.manageEntityAfter.call(this, logReminder.structure_id, null, LogStructure);
        return result;
    }
}

LogReminder.ReminderOptions = ReminderOptions;
LogReminder.ReminderType = ReminderType;
LogReminder.FrequencyOptions = FrequencyOptions;
LogReminder.DurationOptions = DurationOptions;

export default LogReminder;
