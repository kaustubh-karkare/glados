/* eslint-disable func-names */

import assert from 'assert';
import { addDays, compareAsc, subDays } from 'date-fns';
import { LogStructure, filterAsync } from '../data';
import ActionsRegistry from './ActionsRegistry';
import DateUtils from '../common/DateUtils';

ActionsRegistry['latest-log-event'] = async function (input) {
    return this.database.findOne(
        'LogEvent',
        {
            structure_id: input.logStructure.id,
            date: { [this.database.Op.ne]: null },
        },
        [['date', 'DESC']],
    );
};

ActionsRegistry['reminder-check'] = async function (input) {
    const { logStructure } = input;
    assert(logStructure.isPeriodic);
    const todayDate = DateUtils.getTodayDate(this);
    const suppressUntilDate = DateUtils.getDate(logStructure.suppressUntilDate);
    if (compareAsc(todayDate, suppressUntilDate) <= 0) {
        return false;
    }
    const option = LogStructure.Frequency[logStructure.frequency];
    const lookaheadDate = addDays(todayDate, 1 + logStructure.warningDays);
    const reminderDate = option.getPreviousMatch(lookaheadDate, logStructure.frequencyArgs);
    const warningStartDate = subDays(reminderDate, logStructure.warningDays);
    const isWarningActive = compareAsc(warningStartDate, todayDate) <= 0;
    if (!isWarningActive) return false;

    let foundLogEventForReminder = false;
    const latestLogEvent = await this.invoke.call(this, 'latest-log-event', { logStructure });
    if (latestLogEvent) {
        const latestLogEventDate = DateUtils.getDate(latestLogEvent.date);
        if (compareAsc(warningStartDate, latestLogEventDate) <= 0) {
            foundLogEventForReminder = true;
        }
    }
    return !foundLogEventForReminder;
};

ActionsRegistry['reminder-sidebar'] = async function (input) {
    const logStructureGroups = await this.invoke.call(this, 'log-structure-group-list', {
        ordering: true,
    });
    const periodicLogStructures = await this.invoke.call(this, 'log-structure-list', {
        where: { is_periodic: true },
        ordering: true,
    });
    let reminderGroups = await Promise.all(
        logStructureGroups.map(async (logStructureGroup) => {
            const logStructures = await filterAsync(
                periodicLogStructures.filter(
                    (logStructure) => logStructure.logStructureGroup.id === logStructureGroup.id,
                ),
                async (logStructure) => this.invoke.call(this, 'reminder-check', { logStructure }),
            );
            if (!logStructures.length) {
                return null;
            }
            return { ...logStructureGroup, items: logStructures };
        }),
    );
    reminderGroups = reminderGroups.filter((reminderGroup) => reminderGroup);

    const logEvents = await this.invoke.call(this, 'log-event-list', {
        where: {
            is_complete: false,
        },
    });
    if (logEvents.length) {
        reminderGroups.push({ id: 'incomplete', name: 'Incomplete', items: logEvents });
    }

    return reminderGroups;
};

function getSuppressUntilDate(logStructure) {
    assert(logStructure.isPeriodic);
    const today = DateUtils.getTodayDate(this);
    const option = LogStructure.Frequency[logStructure.frequency];
    const ReminderDate = option.getNextMatch(today, logStructure.frequencyArgs);
    const warningStartDate = subDays(ReminderDate, 1 + logStructure.warningDays);
    return DateUtils.getLabel(warningStartDate);
}

ActionsRegistry['reminder-complete'] = async function (input) {
    const { logEvent: inputLogEvent, logStructure: inputLogStructure } = input;
    const result = {};
    result.logEvent = await this.invoke.call(this, 'log-event-upsert', inputLogEvent);
    if (inputLogStructure) {
        inputLogStructure.suppressUntilDate = getSuppressUntilDate.call(
            this,
            inputLogStructure,
        );
        result.logStructure = await this.invoke.call(
            this,
            'log-structure-upsert',
            inputLogStructure,
        );
    }
    this.broadcast('reminder-sidebar');
    return result;
};

ActionsRegistry['reminder-dismiss'] = async function (input) {
    const { logStructure: inputLogStructure } = input;
    inputLogStructure.suppressUntilDate = getSuppressUntilDate.call(
        this,
        inputLogStructure,
    );
    const outputLogStructure = await this.invoke.call(
        this,
        'log-structure-upsert',
        inputLogStructure,
    );
    this.broadcast('reminder-sidebar');
    return { logStructure: outputLogStructure };
};
