/* eslint-disable func-names */

import assert from '../../common/assert';
import { getTodayLabel } from '../../common/DateUtils';
import { getVirtualID } from '../Utils';
import { LogReminder } from '../Mapping';
import ActionsRegistry from './Registry';

ActionsRegistry.dates = async function () {
    const results = await this.database.count('LogEntry', {}, ['date'], this.transaction);
    const dates = new Set(results.filter((result) => result.date).map((result) => result.date));
    dates.add(getTodayLabel());
    return Array.from(dates).sort();
};

ActionsRegistry['reminder-complete'] = async function (input) {
    const inputLogEntry = input.logEntry;
    const today = getTodayLabel();
    const updatedLogEntry = {
        ...inputLogEntry,
        date: today,
        orderingIndex: null, // will be recomputed
        logReminder: null,
    };
    const { type } = inputLogEntry.logReminder.logReminderGroup;
    if (
        type === LogReminder.Type.UNSPECIFIED
        || type === LogReminder.Type.DEADLINE
    ) {
        // update the existing entry
    } else if (
        type === LogReminder.Type.PERIODIC
    ) {
        inputLogEntry.date = null;
        inputLogEntry.logReminder.lastUpdate = today;
        await ActionsRegistry['log-entry-upsert'].call(this, inputLogEntry);
        // duplicate the existing entry
        updatedLogEntry.id = getVirtualID();
    } else {
        assert(false, type);
    }
    const outputLogEntry = await ActionsRegistry['log-entry-upsert'].call(this, updatedLogEntry);
    this.broadcast('log-entry-list', { selector: { date: today } });
    return { logEntry: outputLogEntry };
};
