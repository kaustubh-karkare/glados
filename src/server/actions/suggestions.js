/* eslint-disable func-names */

import assert from 'assert';

import { LogKey } from '../../common/data_types';

const ActionsRegistry = {};

const getOrDefault = (item, key, defaultValue) => {
    if (!(key in item)) item[key] = defaultValue;
    return item[key];
};

const getValues = (logKey) => {
    if (!logKey.value) {
        return [];
    }
    if (logKey.type === LogKey.Type.STRING_LIST) {
        assert(Array.isArray(logKey.value));
        return logKey.value;
    }
    if (logKey.type === LogKey.Type.LOG_TOPIC) {
        return [logKey.value.__id__];
    }
    return [logKey.value];
};

const buildIndex = (items, getLogKeys) => {
    if (!items.length) {
        return null;
    }
    const indexData = {};
    items.forEach((item) => {
        getLogKeys(item).forEach((logKey, index) => {
            const keyIndexData = getOrDefault(indexData, index, { logKey, counts: {} });
            getValues(logKey).forEach((value) => {
                getOrDefault(keyIndexData.counts, value, 0);
                keyIndexData.counts[value] += 1;
            });
        });
    });
    Object.values(indexData).forEach((keyIndexData) => {
        keyIndexData.values = Array.from(Object.entries(keyIndexData.counts))
            .sort((left, right) => left[1] - right[1])
            .map((pair) => pair[0]);
        delete keyIndexData.counts;
    });
    return indexData;
};

const lookupIndex = (indexData, index, query) => {
    if (!indexData) return [];
    const keyIndexData = indexData[index];
    if (!keyIndexData) return [];
    return keyIndexData.values.filter((value) => value.startsWith(query));
};

ActionsRegistry['structure-value-typeahead-index-$cached'] = async function (input) {
    const where = { logStructure: { __id__: input.structure_id } };
    const logEvents = await this.invoke.call(this, 'log-event-list', { where });
    return buildIndex(logEvents, (logEvent) => logEvent.logStructure.eventKeys);
};

ActionsRegistry['topic-value-typeahead-index-$cached'] = async function (input) {
    const where = { parentLogTopic: { __id__: input.parent_topic_id } };
    const childLogTopics = await this.invoke.call(this, 'log-topic-list', { where });
    return buildIndex(childLogTopics, (childLogTopic) => childLogTopic.parentLogTopic.childKeys);
};

ActionsRegistry['value-typeahead'] = async function (input) {
    if (!input.source) {
        return [];
    } if (input.source.__type__ === 'log-structure') {
        const structureValueTypeaheadIndex = await this.invoke.call(
            this,
            'structure-value-typeahead-index',
            { structure_id: input.source.__id__ },
        );
        return lookupIndex(structureValueTypeaheadIndex, input.index, input.query);
    } if (input.source.__type__ === 'log-topic') {
        const topicValueTypeaheadIndex = await this.invoke.call(
            this,
            'topic-value-typeahead-index',
            { parent_topic_id: input.source.__id__ },
        );
        return lookupIndex(topicValueTypeaheadIndex, input.index, input.query);
    }
    throw new Error(`unsupported source: ${input.source.__type__}`);
};

export default ActionsRegistry;
