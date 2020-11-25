/* eslint-disable func-names */

import { LogEvent, awaitSequence } from '../data';
import ActionsRegistry from './ActionsRegistry';
import TextEditorUtils from '../common/TextEditorUtils';

ActionsRegistry['log-event-dates'] = async function (input) {
    // Warning! Having to change context here is an abstraction leak!
    await LogEvent.updateWhere.call({ ...this, DataType: LogEvent }, input.where);
    const results = await this.database.count(
        'LogEvent',
        input.where,
        ['date'],
    );
    const dates = new Set(results.map((result) => result.date));
    return Array.from(dates).sort();
};

ActionsRegistry.consistency = async function () {
    const results = [];
    // These items only contain the __type__, id & name.
    const logTopicItems = await this.invoke.call(this, 'log-topic-typeahead', { query: '' });

    // Update logTopics using latest topic-names
    const logTopics = await this.invoke.call(this, 'log-topic-list');
    await awaitSequence(logTopics, async (logTopic) => {
        try {
            logTopic.details = TextEditorUtils.updateDraftContent(
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
            logStructure.titleTemplate = TextEditorUtils.updateDraftContent(
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
            logEvent.title = TextEditorUtils.updateDraftContent(
                logEvent.title, logTopicItems,
            );
            logEvent.details = TextEditorUtils.updateDraftContent(
                logEvent.details, logTopicItems,
            );
            await this.invoke.call(this, 'log-event-upsert', logEvent);
        } catch (error) {
            results.push([logEvent, error.toString()]);
        }
    });

    return results;
};

ActionsRegistry['validate-log-topic-modes'] = async function ({ logMode, targetLogTopics }) {
    const results = [];
    /*
    // TODO: Enable this feature again!
    await awaitSequence(Object.values(targetLogTopics), async (targetLogTopic) => {
        if (!targetLogTopic.logMode) {
            targetLogTopic = await this.invoke.call(this, 'log-topic-load', targetLogTopic);
        }
        results.push([
            `.logTopic[${targetLogTopic.name}].logMode`,
            targetLogTopic.logMode.id === logMode.id,
            'should match .logMode',
        ]);
    });
    */
    return results;
};
