/* eslint-disable func-names */

import { getTodayLabel } from '../../common/DateUtils';
import { LogTopic } from '../Mapping';
import ActionsRegistry from './Registry';

ActionsRegistry.typeahead = async function ({ query, dataTypes }) {
    const options = await Promise.all(
        dataTypes.map((dataType) => this.invoke.call(this, `${dataType}-typeahead`, { query })),
    );
    return options.flat();
};

ActionsRegistry.dates = async function () {
    const results = await this.database.count('LogEvent', {}, ['date'], this.transaction);
    const dates = new Set(results.filter((result) => result.date).map((result) => result.date));
    dates.add(getTodayLabel());
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
