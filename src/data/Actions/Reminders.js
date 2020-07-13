/* eslint-disable func-names */

import assert from '../../common/assert';
import { LogReminder } from '../Mapping';
import ActionsRegistry from './Registry';

ActionsRegistry['reminder-sidebar'] = async function (input) {
    const logReminders = await this.invoke.call(this, 'log-reminder-list');
    const results = {};
    logReminders.forEach((logReminder) => {
        if (!LogReminder.check(logReminder)) {
            return;
        }
        let logTopic;
        if (logReminder.type === LogReminder.ReminderType.PERIODIC) {
            // For periodic reminders, the immediate parent is used to generate
            // the LogEntry, while the grand-parent is used for grouping.
            logTopic = logReminder.parentLogTopic.parentLogTopic;
        } else {
            logTopic = logReminder.parentLogTopic;
        }
        if (!(logTopic.id in results)) {
            results[logTopic.id] = { logTopic, logReminders: [] };
        }
        results[logTopic.id].logReminders.push(logReminder);
    });
    return Object.entries(results)
        .map(([key, value]) => value);
};

ActionsRegistry['reminder-complete'] = async function (input) {
    const { logEvent: inputLogEvent, logReminder: inputLogReminder } = input;
    let outputLogReminder;
    if (
        inputLogReminder.type === LogReminder.ReminderType.UNSPECIFIED
        || inputLogReminder.type === LogReminder.ReminderType.DEADLINE
    ) {
        await this.invoke.call(this, 'log-reminder-delete', inputLogReminder.id);
        outputLogReminder = null;
    } else if (
        inputLogReminder.type === LogReminder.ReminderType.PERIODIC
    ) {
        inputLogReminder.lastUpdate = inputLogEvent.date;
        outputLogReminder = await this.invoke.call(this, 'log-reminder-upsert', inputLogReminder);
    } else {
        assert(false, inputLogReminder.type);
    }
    const outputLogEvent = await this.invoke.call(this, 'log-event-upsert', inputLogEvent);
    this.broadcast('reminder-sidebar');
    return { logEvent: outputLogEvent, logReminder: outputLogReminder };
};

ActionsRegistry['reminder-dismiss'] = async function (input) {
    const { logReminder: inputLogReminder } = input;
    const outputLogReminder = await this.invoke.call(this, 'log-reminder-upsert', inputLogReminder);
    this.broadcast('reminder-sidebar');
    return { logReminder: outputLogReminder };
};
