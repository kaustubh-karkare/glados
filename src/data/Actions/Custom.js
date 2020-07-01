/* eslint-disable func-names */

import assert from '../../common/assert';
import { getTodayLabel } from '../../common/DateUtils';
import { LogReminder, LogTopic } from '../Mapping';
import ActionsRegistry from './Registry';

ActionsRegistry.typeahead = async function ({ query, dataTypes }) {
    const options = await Promise.all(
        dataTypes.map((dataType) => this.invoke.call(this, `${dataType}-typeahead`, { query })),
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
        await this.invoke.call(this, 'log-reminder-delete', inputLogReminder.id);
        outputLogReminder = null;
    } else if (
        inputLogReminder.type === LogReminder.Type.PERIODIC
    ) {
        inputLogReminder.lastUpdate = inputLogEntry.date;
        outputLogReminder = await this.invoke.call(this, 'log-reminder-upsert', inputLogReminder);
    } else {
        assert(false, inputLogReminder.type);
    }
    const outputLogEntry = await this.invoke.call(this, 'log-entry-upsert', inputLogEntry);
    this.broadcast('log-entry-list', { selector: { date: inputLogEntry.date } });
    return { logEntry: outputLogEntry, logReminder: outputLogReminder };
};

ActionsRegistry.consistency = async function () {
    const outputLogTopics = await this.invoke.call(this, 'log-topic-list');
    const outputLogEntries = await this.invoke.call(this, 'log-entry-list');
    await Promise.all(
        outputLogEntries.map((outputLogEntry) => {
            outputLogEntry.title = LogTopic.updateLogTopics(
                outputLogEntry.title, outputLogTopics,
            );
            outputLogEntry.details = LogTopic.updateLogTopics(
                outputLogEntry.details, outputLogTopics,
            );
            return this.invoke.call(this, 'log-entry-upsert', outputLogEntry);
        }),
    );
};
