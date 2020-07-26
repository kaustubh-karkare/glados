/* eslint-disable func-names */

import { LogEvent, LogTopic, awaitSequence } from '../data';
import ActionsRegistry from './ActionsRegistry';

ActionsRegistry.typeahead = async function ({ query, dataTypes }) {
    const options = await Promise.all(
        dataTypes.map((dataType) => this.invoke.call(this, `${dataType}-typeahead`, { query })),
    );
    return options.flat();
};

ActionsRegistry['log-event-dates'] = async function (input) {
    input = await LogEvent.updateSelector.call(this, input);
    const results = await this.database.count(
        'LogEvent',
        input.selector,
        ['date'],
        this.transaction,
    );
    const dates = new Set(results.filter((result) => result.date).map((result) => result.date));
    return Array.from(dates).sort();
};

ActionsRegistry['value-typeahead'] = async function (input) {
    const outputLogEvents = await this.invoke.call(
        this, 'log-event-list', { selector: { structure_id: input.structure_id } },
    );
    const resultToFrequencyMap = {};
    outputLogEvents.forEach((outputLogEvent) => {
        const { value } = outputLogEvent.logStructure.logKeys[input.index];
        if (value.startsWith(input.query)) {
            if (!(value in resultToFrequencyMap)) {
                resultToFrequencyMap[value] = 0;
            }
            resultToFrequencyMap[value] += 1;
        }
    });
    return Object.entries(resultToFrequencyMap)
        .sort((left, right) => right[1] - left[1])
        .map((item) => item[0]);
};

ActionsRegistry.consistency = async function () {
    const results = [];
    const logTopics = await this.invoke.call(this, 'log-topic-typeahead', { query: '' });

    // Update logStructures using latest topic-names
    const logStructures = await this.invoke.call(this, 'log-structure-list');
    await awaitSequence(logStructures, async (logStructure) => {
        try {
            logStructure.titleTemplate = LogTopic.updateContent(
                logStructure.titleTemplate, logTopics,
            );
            await this.invoke.call(this, 'log-structure-upsert', logStructure);
        } catch (error) {
            results.push([logStructure, error.toString()]);
        }
    });

    // Update logEvents using latest topic-names & structure-title-template.
    const logEvents = await this.invoke.call(this, 'log-event-list');
    await awaitSequence(logEvents, async (logEvent) => {
        try {
            logEvent.title = LogTopic.updateContent(
                logEvent.title, logTopics,
            );
            logEvent.details = LogTopic.updateContent(
                logEvent.details, logTopics,
            );
            await this.invoke.call(this, 'log-event-upsert', logEvent);
        } catch (error) {
            results.push([logEvent, error.toString()]);
        }
    });

    return results;
};
