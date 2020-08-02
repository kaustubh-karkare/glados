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
    input = await LogEvent.updateWhere.call(this, input);
    const results = await this.database.count(
        'LogEvent',
        input.where,
        ['date'],
        this.transaction,
    );
    const dates = new Set(results.map((result) => result.date));
    return Array.from(dates).sort();
};

ActionsRegistry['value-typeahead'] = async function (input) {
    const outputLogEvents = await this.invoke.call(
        this, 'log-event-list', { where: { structure_id: input.structure_id } },
    );
    const resultToFrequencyMap = {};
    outputLogEvents.forEach((outputLogEvent) => {
        const logKey = outputLogEvent.logStructure.logKeys[input.index];
        // If logKey.type = time, then sort by closeness.
        const { value } = logKey;
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
    // These items only contain the __type__, id & name.
    const logTopicItems = await this.invoke.call(this, 'log-topic-typeahead', { query: '' });

    // Update logTopics using latest topic-names
    const logTopics = await this.invoke.call(this, 'log-topic-list');
    await awaitSequence(logTopics, async (logTopic) => {
        try {
            logTopic.details = LogTopic.updateContent(
                logTopic.details, logTopicItems,
            );
            await this.invoke.call(this, 'log-topic-upsert', logTopic);
        } catch (error) {
            results.push([logTopic, error.toString()]);
        }
    });

    // Update logStructures using latest topic-names
    const logStructures = await this.invoke.call(this, 'log-structure-list');
    await awaitSequence(logStructures, async (logStructure) => {
        try {
            logStructure.titleTemplate = LogTopic.updateContent(
                logStructure.titleTemplate, logTopicItems,
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
                logEvent.title, logTopicItems,
            );
            logEvent.details = LogTopic.updateContent(
                logEvent.details, logTopicItems,
            );
            await this.invoke.call(this, 'log-event-upsert', logEvent);
        } catch (error) {
            results.push([logEvent, error.toString()]);
        }
    });

    return results;
};
