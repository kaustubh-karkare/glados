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
import LogReminderGroup from './LogReminderGroup';
import LogStructure from './LogStructure';
import {
    getVirtualID, isRealItem, manageEntityBefore, manageEntityAfter,
} from './Utils';
import Enum from '../common/Enum';


const { ReminderType } = LogReminderGroup;

const LogReminderTypeDefaultValues = {
    [ReminderType.UNSPECIFIED]: {
        deadline: null,
        warning: null,
        frequency: null,
        lastUpdate: null,
    },
    [ReminderType.DEADLINE]: {
        deadline: '{tomorrow}',
        warning: '1 day',
        frequency: null,
        lastUpdate: null,
    },
    [ReminderType.PERIODIC]: {
        deadline: null,
        warning: null,
        frequency: 'everyday',
        lastUpdate: '{today}',
    },
};

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
    static createVirtual({ title, logReminderGroup }) {
        const item = {
            id: getVirtualID(),
            title: title || '',
            isMajor: true,
            logReminderGroup,
            type: logReminderGroup.type,
            ...LogReminderTypeDefaultValues[logReminderGroup.type],
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

        if (!isRealItem(inputLogReminder.logReminderGroup)) {
            results.push(['.logReminderGroup', false, 'is missing!']);
            return results;
        }
        results.push(this.validateNonEmptyString('.title', inputLogReminder.title));

        const { type } = inputLogReminder.logReminderGroup;
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
            results.push([
                '.logStructure',
                inputLogReminder.logStructure,
                'is required for periodic reminders!',
            ]);
        } else {
            results.push(['.type', false, ' is invalid!']);
        }

        if (inputLogReminder.logStructure) {
            const logStructureResults = await this.validateRecursive(
                LogStructure, '.logStructure', inputLogReminder.logStructure,
            );
            results.push(...logStructureResults);
            if (inputLogReminder.logStructure.logKeys.length > 0) {
                results.push([
                    '.needsEdit',
                    inputLogReminder.needsEdit,
                    'should be set for structures with keys!',
                ]);
            }
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
            isMajor: logReminder.is_major,
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
        let logReminder = await this.database.findItem(
            'LogReminder',
            inputLogReminder,
            this.transaction,
        );

        const prevStructureId = logReminder && logReminder.structure_id;
        const nextStructureId = await manageEntityBefore.call(
            this, inputLogReminder.logStructure, LogStructure,
        );

        assert(isRealItem(inputLogReminder.logReminderGroup));
        const orderingIndex = await Base.getOrderingIndex.call(this, logReminder, {
            group_id: inputLogReminder.logReminderGroup.id,
        });
        const fields = {
            title: inputLogReminder.title,
            group_id: inputLogReminder.logReminderGroup.id,
            ordering_index: orderingIndex,
            type: inputLogReminder.logReminderGroup.type,
            deadline: inputLogReminder.deadline,
            warning: inputLogReminder.warning,
            frequency: inputLogReminder.frequency,
            last_update: inputLogReminder.lastUpdate,
            needs_edit: inputLogReminder.needsEdit,
            is_major: inputLogReminder.isMajor,
            structure_id: nextStructureId,
        };
        logReminder = await this.database.createOrUpdateItem(
            'LogReminder', logReminder, fields, this.transaction,
        );

        await manageEntityAfter.call(
            this, prevStructureId, inputLogReminder.logStructure, LogStructure,
        );

        this.broadcast('log-reminder-list');
        return logReminder.id;
    }

    static async delete(id) {
        const logReminder = await this.database.findByPk('LogReminder', id, this.transaction);
        const result = await Base.delete.call(this, logReminder.id);
        // TODO: Disassociate structure instead of deleteing it!
        await manageEntityAfter.call(this, logReminder.structure_id, null, LogStructure);
        return result;
    }
}

LogReminder.ReminderOptions = LogReminderGroup.ReminderOptions;
LogReminder.ReminderType = ReminderType;
LogReminder.FrequencyOptions = FrequencyOptions;
LogReminder.DurationOptions = DurationOptions;

export default LogReminder;
