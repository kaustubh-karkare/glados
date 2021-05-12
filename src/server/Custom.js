/* eslint-disable func-names */

import assert from 'assert';

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

ActionsRegistry['fix-birthdays-anniversaries'] = async function () {
    const ID_TO_NAME = {
        9: 'Birthdays',
        13: 'Anniversaries',
    };
    const logStructureGroups = await this.invoke.call(
        this,
        'log-structure-group-list',
        { where: { id: Object.keys(ID_TO_NAME) } },
    );
    return Promise.all(
        logStructureGroups.map(async (logStructureGroup) => {
            assert(
                ID_TO_NAME[logStructureGroup.id] === logStructureGroup.name,
                logStructureGroup.name,
            );
            const logStructures = await this.invoke.call(
                this,
                'log-structure-list',
                { where: { logStructureGroup } },
            );
            return Promise.all(
                logStructures.map(async (logStructure) => {
                    const nameRegexResult = logStructure.name.match(/^(\d{2}-\d{2})\w?$/);
                    assert(nameRegexResult, logStructure.name);
                    const expectedValues = {
                        isPeriodic: true,
                        frequency: 'yearly',
                        frequencyArgs: nameRegexResult[1],
                        reminderText: TextEditorUtils.extractPlainText(logStructure.titleTemplate),
                        warningDays: 2,
                    };
                    let needsUpdate = false;
                    Object.keys(expectedValues).forEach((key) => {
                        if (logStructure[key] !== expectedValues[key]) {
                            logStructure[key] = expectedValues[key];
                            needsUpdate = true;
                        }
                    });
                    if (!needsUpdate) {
                        return logStructure;
                    }
                    return this.invoke.call(
                        this,
                        'log-structure-upsert',
                        logStructure,
                    );
                }),
            );
        }),
    );
};
