/* eslint-disable func-names */

import assert from 'assert';
import { addDays, compareAsc, subDays } from 'date-fns';
import { LogStructure } from '../../common/data_types';
import { asyncFilter } from '../../common/async_utils';
import DateUtils from '../../common/date_utils';

const ActionsRegistry = {};

ActionsRegistry['latest-log-event'] = async function (input) {
    return this.database.findOne(
        'LogEvent',
        {
            structure_id: input.logStructure.__id__,
            date: { [this.database.Op.ne]: null },
        },
        [['date', 'DESC']],
    );
};

ActionsRegistry['reminder-check'] = async function (input) {
    const { logStructure } = input;
    assert(logStructure.isPeriodic);

    // If the reminder is suppressed, return early.
    const todayDate = DateUtils.getTodayDate(this);
    const suppressUntilDate = DateUtils.getDate(logStructure.suppressUntilDate);
    if (compareAsc(todayDate, suppressUntilDate) <= 0) {
        return false;
    }

    // If the warning start date is in the future, return early.
    const option = LogStructure.Frequency[logStructure.frequency];
    const lookaheadDate = addDays(todayDate, 1 + logStructure.warningDays);
    const reminderDate = option.getPreviousMatch(lookaheadDate, logStructure.frequencyArgs);
    const warningStartDate = subDays(reminderDate, logStructure.warningDays);
    const isWarningActive = compareAsc(warningStartDate, todayDate) <= 0;
    if (!isWarningActive) return false;

    // If there was an event since the warning start date, return early.
    const latestLogEvent = await this.invoke.call(this, 'latest-log-event', { logStructure });
    if (latestLogEvent) {
        const latestLogEventDate = DateUtils.getDate(latestLogEvent.date);
        if (compareAsc(warningStartDate, latestLogEventDate) <= 0) {
            return false;
        }
    }

    return true;
};

ActionsRegistry['reminder-score'] = async function (input) {
    const { logStructure } = input;
    assert(logStructure.isPeriodic);

    // While the reminder-check is O(1), this operation is O(n).
    const logEvents = await this.database.findAll(
        'LogEvent',
        {
            structure_id: logStructure.__id__,
            date: { [this.database.Op.ne]: null },
        },
        [['date', 'DESC']],
    );

    // The "window of opportunity" is defined as the start of the warning for one reminder,
    // to the start of the warning for the next reminder.
    const option = LogStructure.Frequency[logStructure.frequency];
    const todayDate = DateUtils.getTodayDate(this);
    const nextReminderDate = option.getNextMatch(
        // Using addDays here, so that deadlineDate will be in the future.
        addDays(todayDate, logStructure.warningDays),
        logStructure.frequencyArgs,
    );
    const deadlineDate = subDays(nextReminderDate, 1 + logStructure.warningDays);

    // Start from the current window, and then go as far back as needed to compute the score.
    let currentDate = addDays(todayDate, 1 + logStructure.warningDays);
    let value = 0;
    let deadline = null;
    const dateRanges = [];
    let firstIteration = true;
    while (logEvents.length) {
        const reminderDate = option.getPreviousMatch(currentDate, logStructure.frequencyArgs);
        const warningStartDate = subDays(reminderDate, logStructure.warningDays);
        let foundLogEventInReminderWindow = false;
        while (logEvents.length) { // loop in case of multiple events in one window.
            const logEventDate = DateUtils.getDate(logEvents[0].date);
            if (compareAsc(logEventDate, currentDate) < 0) {
                foundLogEventInReminderWindow = compareAsc(warningStartDate, logEventDate) <= 0;
                break;
            } else {
                logEvents.shift();
            }
        }
        let dateRange = `${DateUtils.getLabel(warningStartDate)}`;
        if (compareAsc(warningStartDate, subDays(currentDate, 1)) < 0) {
            dateRange += ` to ${DateUtils.getLabel(currentDate)}`;
        }
        currentDate = warningStartDate;
        if (firstIteration) { // special handling for currently open window.
            firstIteration = false;
            if (!foundLogEventInReminderWindow) {
                deadline = DateUtils.getLabel(deadlineDate);
                // eslint-disable-next-line no-continue
                continue;
            }
        }
        if (foundLogEventInReminderWindow) {
            if (value >= 0) {
                value += 1;
                dateRanges.push(dateRange);
            } else {
                break;
            }
        } else {
            // eslint-disable-next-line no-lonely-if
            if (value <= 0) {
                value -= 1;
                dateRanges.push(dateRange);
            } else {
                break;
            }
        }
    }

    return { value, deadline, dateRanges };
};

ActionsRegistry['reminder-sidebar'] = async function (input = {}) {
    const logStructureGroups = await this.invoke.call(this, 'log-structure-group-list', {
        ordering: true,
        where: input.where,
    });
    const periodicLogStructures = await this.invoke.call(this, 'log-structure-list', {
        where: { isPeriodic: true },
        ordering: true,
    });
    const reminderGroups = await Promise.all(
        logStructureGroups.map(async (logStructureGroup) => {
            const logStructures = await asyncFilter(
                periodicLogStructures.filter(
                    (logStructure) => logStructure.logStructureGroup.__id__
                        === logStructureGroup.__id__,
                ),
                async (logStructure) => this.invoke.call(this, 'reminder-check', { logStructure }),
            );
            if (!logStructures.length) {
                return null;
            }
            await Promise.all(logStructures.map(async (logStructure) => {
                logStructure.reminderScore = await this.invoke.call(this, 'reminder-score', { logStructure });
            }));
            return { ...logStructureGroup, logStructures };
        }),
    );
    return reminderGroups.filter((reminderGroup) => reminderGroup);
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

export default ActionsRegistry;
