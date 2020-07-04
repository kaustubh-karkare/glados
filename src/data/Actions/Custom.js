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
    let dates = new Set(results.filter((result) => result.date).map((result) => result.date));
    dates.add(getTodayLabel());
    dates = Array.from(dates).sort();
    return dates.slice(dates.length - 1);
};

ActionsRegistry['value-typeahead'] = async function (input) {
    const outputLogEntries = await this.invoke.call(
        this, 'log-entry-list', { selector: { structure_id: input.structure_id } },
    );
    const results = [];
    outputLogEntries.forEach((outputLogEntry) => {
        const { value } = outputLogEntry.logStructure.logKeys[input.index];
        if (value.startsWith(input.query)) {
            results.push(value);
        }
    });
    return Array.from(new Set(results));
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
            outputLogEntry.title = LogTopic.updateContent(
                outputLogEntry.title, outputLogTopics,
            );
            outputLogEntry.details = LogTopic.updateContent(
                outputLogEntry.details, outputLogTopics,
            );
            return this.invoke.call(this, 'log-entry-upsert', outputLogEntry);
        }),
    );
};
