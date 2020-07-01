/* eslint-disable func-names */

import assert from '../../common/assert';
import { getTodayLabel } from '../../common/DateUtils';
import { LogReminder } from '../Mapping';
import ActionsRegistry from './Registry';

ActionsRegistry.typeahead = async function ({ query, dataTypes }) {
    const options = await Promise.all(
        dataTypes.map((dataType) => ActionsRegistry[`${dataType}-typeahead`].call(this, { query })),
    );
    return options.flat();
};

ActionsRegistry.dates = async function () {
    const results = await this.database.count('LogEntry', {}, ['date'], this.transaction);
    const dates = new Set(results.filter((result) => result.date).map((result) => result.date));
    dates.clear();
    dates.add(getTodayLabel());
    return Array.from(dates).sort();
};

ActionsRegistry['reminder-complete'] = async function (input) {
    const { logEntry: inputLogEntry, logReminder: inputLogReminder } = input;
    let outputLogReminder;
    if (
        inputLogReminder.type === LogReminder.Type.UNSPECIFIED
        || inputLogReminder.type === LogReminder.Type.DEADLINE
    ) {
        await ActionsRegistry['log-reminder-delete']
            .call(this, inputLogReminder.id);
        outputLogReminder = null;
    } else if (
        inputLogReminder.type === LogReminder.Type.PERIODIC
    ) {
        inputLogReminder.lastUpdate = inputLogEntry.date;
        outputLogReminder = await ActionsRegistry['log-reminder-upsert']
            .call(this, inputLogReminder);
    } else {
        assert(false, inputLogReminder.type);
    }
    const outputLogEntry = await ActionsRegistry['log-entry-upsert'].call(this, inputLogEntry);
    this.broadcast('log-entry-list', { selector: { date: inputLogEntry.date } });
    return { logEntry: outputLogEntry, logReminder: outputLogReminder };
};
