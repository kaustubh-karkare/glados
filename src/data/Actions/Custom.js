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
    const results = await this.database.count('LogEvent', {}, ['date'], this.transaction);
    let dates = new Set(results.filter((result) => result.date).map((result) => result.date));
    dates.add(getTodayLabel());
    dates = Array.from(dates).sort();
    return dates.slice(dates.length - dates.length);
};

ActionsRegistry['value-typeahead'] = async function (input) {
    const outputLogEvents = await this.invoke.call(
        this, 'log-event-list', { selector: { structure_id: input.structure_id } },
    );
    const results = [];
    outputLogEvents.forEach((outputLogEvent) => {
        const { value } = outputLogEvent.logStructure.logKeys[input.index];
        if (value.startsWith(input.query)) {
            results.push(value);
        }
    });
    return Array.from(new Set(results));
};

ActionsRegistry['reminder-complete'] = async function (input) {
    const { logEvent: inputLogEvent, logReminder: inputLogReminder } = input;
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
        inputLogReminder.lastUpdate = inputLogEvent.date;
        outputLogReminder = await this.invoke.call(this, 'log-reminder-upsert', inputLogReminder);
    } else {
        assert(false, inputLogReminder.type);
    }
    const outputLogEvent = await this.invoke.call(this, 'log-event-upsert', inputLogEvent);
    this.broadcast('log-event-list', { selector: { date: inputLogEvent.date } });
    return { logEvent: outputLogEvent, logReminder: outputLogReminder };
};

ActionsRegistry.consistency = async function () {
    const outputLogTopics = await this.invoke.call(this, 'log-topic-list');
    const outputLogEvents = await this.invoke.call(this, 'log-event-list');
    await Promise.all(
        outputLogEvents.map((outputLogEvent) => {
            outputLogEvent.title = LogTopic.updateContent(
                outputLogEvent.title, outputLogTopics,
            );
            outputLogEvent.details = LogTopic.updateContent(
                outputLogEvent.details, outputLogTopics,
            );
            return this.invoke.call(this, 'log-event-upsert', outputLogEvent);
        }),
    );
};
