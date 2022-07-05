/* eslint-disable func-names */
/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable no-constant-condition */

import assert from 'assert';

import { asyncSequence } from '../../common/AsyncUtils';
import { getPartialItem } from '../../common/data_types';
import RichTextUtils from '../../common/RichTextUtils';

const ActionsRegistry = {};

ActionsRegistry['check-consistency'] = async function () {
    const results = [];
    // These items only contain the __type__, __id__ & name.
    const logTopicItems = await this.invoke.call(this, 'log-topic-typeahead', { query: '' });

    if (false) {
        // Update logTopics using latest topic-names
        const logTopics = await this.invoke.call(this, 'log-topic-list');
        await asyncSequence(logTopics, async (logTopic) => {
            try {
                logTopic.details = RichTextUtils.updateDraftContent(
                    logTopic.details, logTopicItems,
                );
                await this.invoke.call(this, 'log-topic-upsert', logTopic);
            } catch (error) {
                results.push([logTopic, error.toString()]);
            }
        });
    }

    if (false) {
        // Update logStructures using latest topic-names
        const logStructures = await this.invoke.call(this, 'log-structure-list');
        await asyncSequence(logStructures, async (logStructure) => {
            try {
                logStructure.titleTemplate = RichTextUtils.updateDraftContent(
                    logStructure.titleTemplate, logTopicItems,
                );
                // TODO: Update topics in keys too.
                await this.invoke.call(this, 'log-structure-upsert', logStructure);
            } catch (error) {
                results.push([logStructure, error.toString()]);
            }
        });
    }

    if (false) {
        // Update logEvents using latest topic-names & structure-title-template.
        const logEvents = await this.invoke.call(this, 'log-event-list');
        await asyncSequence(logEvents, async (logEvent) => {
            try {
                logEvent.title = RichTextUtils.updateDraftContent(
                    logEvent.title, logTopicItems,
                );
                logEvent.details = RichTextUtils.updateDraftContent(
                    logEvent.details, logTopicItems,
                );
                await this.invoke.call(this, 'log-event-upsert', logEvent);
            } catch (error) {
                results.push([logEvent, error.toString()]);
            }
        });
    }

    return results;
};

ActionsRegistry['fix-birthdays-anniversaries'] = async function () {
    // Update structures so that they each have similar behavior.

    const GROUP_ID_TO_NAME = {
        9: 'Birthdays',
        13: 'Anniversaries',
    };
    const logStructureGroups = await this.invoke.call(
        this,
        'log-structure-group-list',
        { where: { __id__: Object.keys(GROUP_ID_TO_NAME) } },
    );
    return Promise.all(
        logStructureGroups.map(async (logStructureGroup) => {
            assert(
                GROUP_ID_TO_NAME[logStructureGroup.__id__] === logStructureGroup.name,
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
                        reminderText: RichTextUtils.extractPlainText(logStructure.titleTemplate),
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

ActionsRegistry['update-television-events'] = async function (data) {
    // Used to change "Television" structure events
    // to use a topic as a log-key, instead of a string.

    const structure_id = data.log_structures
        .filter((log_structure) => log_structure.name === 'Television')[0].id;
    const parent_topic_id = data.log_topics
        .filter((log_topic) => log_topic.name === 'Television Series')[0].id;
    const value_index = 0;

    data.log_structures.forEach((log_structure) => {
        if (log_structure.id === structure_id) {
            const keys = JSON.parse(log_structure.keys);
            keys[0].type = 'log_topic';
            keys[0].is_optional = false;
            keys[0].parent_topic_id = parent_topic_id;
            log_structure.keys = JSON.stringify(keys);
            data.log_structures_to_log_topics.push({
                source_structure_id: log_structure.id,
                target_topic_id: parent_topic_id,
            });
        }
    });
    let maxTopicId = Math.max(...data.log_topics.map((log_topic) => log_topic.id));
    const nameToTopicId = {};
    data.log_topics.forEach((log_topic) => {
        if (log_topic.parent_topic_id === parent_topic_id) {
            nameToTopicId[log_topic.name] = log_topic.id;
        }
    });
    data.log_events.forEach((log_event) => {
        if (log_event.structure_id === structure_id) {
            const values = JSON.parse(log_event.structure_values);
            const series_name = values[value_index];
            if (!nameToTopicId[series_name]) {
                maxTopicId += 1;
                const new_topic_id = maxTopicId;
                data.log_topics.push({
                    id: new_topic_id,
                    mode_id: 1,
                    parent_topic_id,
                    ordering_index: 0,
                    name: series_name,
                    details: '',
                    child_count: 0,
                    is_favorite: 0,
                    is_deprecated: 0,
                });
                nameToTopicId[series_name] = new_topic_id;
            }
            const topic_id = nameToTopicId[series_name];
            values[value_index] = {
                __type__: 'log-topic',
                __id__: topic_id,
                name: series_name,
            };
            log_event.structure_values = JSON.stringify(values);
            data.log_events_to_log_topics.push({
                source_event_id: log_event.id,
                target_topic_id: topic_id,
            });
        }
    });
    if (false) {
        const name_to_count = {};
        data.log_topics.forEach((log_topic) => {
            if (!(log_topic.name in name_to_count)) {
                name_to_count[log_topic.name] = 0;
            }
            name_to_count[log_topic.name] += 1;
        });
        const multiple_topics = Object.entries(name_to_count).filter((kvp) => kvp[1] > 1);
        if (multiple_topics.length) console.info(multiple_topics);
    }
    const validate = async () => {
        const logStructure = await this.invoke.call(this, 'log-structure-load', { __id__: structure_id });
        await this.invoke.call(this, 'log-structure-upsert', logStructure);
    };
    return { data, validate };
};

ActionsRegistry['update-xyz-events'] = async function (data) {
    const log_structure = data.log_structures.filter((item) => item.name === 'xyz')[0];

    const keys = JSON.parse(log_structure.keys);
    keys.splice(2, 1, ...[
        {
            name: 'xyz',
            type: 'string',
            is_optional: false,
            template: null,
            parent_topic_id: null,
        },
        {
            name: 'xyz',
            type: 'string',
            is_optional: false,
            template: null,
            parent_topic_id: null,
        },
    ]);
    log_structure.keys = JSON.stringify(keys);

    const mapping = {};
    data.log_events.forEach((log_event) => {
        if (log_event.structure_id === log_structure.id) {
            const values = JSON.parse(log_event.structure_values);
            const new_status_values = mapping[values[2]];
            if (!new_status_values) {
                throw log_event;
            }
            values.splice(2, 1, ...new_status_values);
            log_event.structure_values = JSON.stringify(values);
        }
    });
    return { data };
};

ActionsRegistry['add-structure-to-events'] = async function () {
    // Used to add "Project Work" structure to events with the "GLADOS" topic.
    const logTopic = await this.invoke.call(this, 'log-topic-load', { __id__: 4 });
    const logStructure = await this.invoke.call(this, 'log-structure-load', { __id__: 120 });
    const logEvents = await this.invoke.call(
        this,
        'log-event-list',
        { where: { logTopics: [logTopic], logStructure: null } },
    );

    const prefix = `${logTopic.name}: `;
    await Promise.all(logEvents.map(async (logEvent) => {
        const oldTitleText = RichTextUtils.extractPlainText(logEvent.title);
        if (logEvent.logStructure || !oldTitleText.startsWith(prefix)) {
            return;
        }
        logEvent.logStructure = {
            ...logStructure,
            eventKeys: logStructure.eventKeys.map((logKey) => ({ ...logKey })),
        };
        logEvent.logStructure.eventKeys[0].value = getPartialItem(logTopic);
        logEvent.logStructure.eventKeys[1].value = RichTextUtils.removePrefixFromDraftContext(
            logEvent.title,
            prefix,
        );
        // Warning! May need to disable this.database.setEdges in LogEvent.save() to avoid timeout.
        logEvent = await this.invoke.call(this, 'log-event-upsert', logEvent);
        const newTitleText = RichTextUtils.extractPlainText(logEvent.title);
        console.info('Old:', oldTitleText);
        console.info('New:', newTitleText);
    }));
};

ActionsRegistry['convert-structure-to-topics'] = async function (data) {
    // Create topics for events with "Movie" structures.
    let last_topic_id = Math.max(...data.log_topics.map((log_topic) => log_topic.id));
    last_topic_id += 1;
    const movies_topic_id = last_topic_id;
    data.log_topics.push({
        id: last_topic_id,
        parent_topic_id: 458,
        ordering_index: 24,
        name: 'Movies',
        details: '',
        child_count: 0,
        is_favorite: 0,
        is_deprecated: 0,
        child_keys: JSON.stringify([
            { name: 'Name', type: 'string', is_optional: true },
            { name: 'IMDB Link', type: 'string', is_optional: true },
            { name: 'Stream Link', type: 'string', is_optional: true },
            { name: 'Worthwhile?', type: 'yes_or_no' },
        ]),
        parent_values: null,
    });
    data.log_structures.forEach((log_structure) => {
        if (log_structure.id === 41) {
            log_structure.event_keys = JSON.stringify([
                { name: 'Movie', type: 'log_topic', parent_topic_id: movies_topic_id },
            ]);
        }
    });
    const nameToTopicId = {};
    data.log_events.forEach((log_event) => {
        if (log_event.structure_id === 41) {
            const structure_values = JSON.parse(log_event.structure_values);
            const topicName = structure_values[0];
            let topic_id;
            if (topicName in nameToTopicId) {
                topic_id = nameToTopicId[topicName];
            } else {
                last_topic_id += 1;
                data.log_topics.push({
                    id: last_topic_id,
                    parent_topic_id: movies_topic_id,
                    ordering_index: 0,
                    name: topicName,
                    details: log_event.details,
                    child_count: 0,
                    is_favorite: 0,
                    is_deprecated: 0,
                    child_keys: null,
                    parent_values: JSON.stringify([
                        topicName,
                        structure_values[1],
                        null,
                        structure_values[2],
                    ]),
                });
                log_event.details = '';
                topic_id = last_topic_id;
            }
            log_event.structure_values = JSON.stringify([
                {
                    __type__: 'log-topic',
                    __id__: topic_id,
                    name: topicName,
                },
            ]);
        }
    });

    const nameToCount = {};
    data.log_topics.forEach((log_topic) => {
        if (log_topic.name in nameToCount) {
            nameToCount[log_topic.name] += 1;
        } else {
            nameToCount[log_topic.name] = 1;
        }
    });

    return { data };
};

export default ActionsRegistry;
