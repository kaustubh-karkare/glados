import { asyncSequence } from '../AsyncUtils';
import RichTextUtils from '../RichTextUtils';
import DataTypeBase from './base';
import LogStructureKey from './LogStructureKey';
import { getVirtualID } from './utils';
import { validateNonEmptyString, validateRecursiveList } from './validation';

class LogTopic extends DataTypeBase {
    static createVirtual({ parentLogTopic = null, name = '' } = {}) {
        return {
            __type__: 'log-topic',
            __id__: getVirtualID(),
            parentLogTopic,
            name,
            details: null,
            childKeys: null,
            childCount: 0,
            isFavorite: false,
            isDeprecated: false,
        };
    }

    static async updateWhere(where) {
        await DataTypeBase.updateWhere.call(this, where, {
            __id__: 'id',
            isFavorite: 'is_favorite',
            isDeprecated: 'is_deprecated',
            parentLogTopic: 'parent_topic_id',
        });
    }

    static extractLogTopics(inputLogTopic) {
        let logTopics = RichTextUtils.extractMentions(inputLogTopic.details, 'log-topic');
        if (inputLogTopic.parentLogTopic && inputLogTopic.parentLogTopic.childKeys) {
            inputLogTopic.parentLogTopic.childKeys.forEach((inputLogKey) => {
                const additionalLogTopics = LogStructureKey.extractLogTopics.call(
                    this,
                    inputLogKey,
                );
                logTopics = { ...logTopics, ...additionalLogTopics };
            });
        }
        return logTopics;
    }

    static async validate(inputLogTopic) {
        const results = [];
        results.push(validateNonEmptyString('.name', inputLogTopic.name));

        if (inputLogTopic.childKeys) {
            results.push(...await validateRecursiveList.call(
                this,
                LogStructureKey,
                '.childKeys',
                inputLogTopic.childKeys,
            ));
        }

        if (inputLogTopic.parentLogTopic && inputLogTopic.parentLogTopic.childKeys) {
            const logKeyResults = await Promise.all(
                inputLogTopic.parentLogTopic.childKeys.map(
                    async (inputLogKey, index) => LogStructureKey.validateValue.call(
                        this,
                        inputLogKey,
                        index,
                    ),
                ),
            );
            results.push(...logKeyResults.filter((result) => result));
        }

        return results;
    }

    static async load(id) {
        const logTopic = await this.database.findByPk('LogTopic', id);
        let outputParentLogTopic = null;
        if (logTopic.parent_topic_id) {
            // Intentionally loading only partial data.
            const parentLogTopic = await this.database.findByPk(
                'LogTopic',
                logTopic.parent_topic_id,
            );
            let outputParentChildKeys = null;
            if (parentLogTopic.child_keys) {
                outputParentChildKeys = await Promise.all(
                    JSON.parse(parentLogTopic.child_keys).map(
                        (logKey, index) => LogStructureKey.load.call(this, logKey, index + 1),
                    ),
                );
                const values = JSON.parse(logTopic.values);
                outputParentChildKeys.forEach((logKey, index) => {
                    logKey.value = values[index] || null;
                });
            }
            outputParentLogTopic = {
                __type__: 'log-topic',
                __id__: parentLogTopic.id,
                name: parentLogTopic.name,
                childKeys: outputParentChildKeys,
            };
        }
        let outputChildKeys = null;
        if (logTopic.child_keys) {
            outputChildKeys = await Promise.all(
                JSON.parse(logTopic.child_keys).map(
                    (logKey, index) => LogStructureKey.load.call(this, logKey, index + 1),
                ),
            );
        }
        return {
            __type__: 'log-topic',
            __id__: logTopic.id,
            parentLogTopic: outputParentLogTopic,
            name: logTopic.name,
            details: RichTextUtils.deserialize(
                logTopic.details,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            childKeys: outputChildKeys,
            childCount: logTopic.child_count,
            isFavorite: logTopic.is_favorite,
            isDeprecated: logTopic.is_deprecated,
        };
    }

    static async save(inputLogTopic) {
        let logTopic = await this.database.findItem('LogTopic', inputLogTopic);

        const original = {};
        if (logTopic) {
            original.name = logTopic.name;
            original.parent_topic_id = logTopic.parent_topic_id;
            original.child_keys = logTopic.child_keys;
        }

        const orderingIndex = await DataTypeBase.getOrderingIndex.call(this, logTopic);
        let childKeys;
        if (inputLogTopic.childKeys) {
            childKeys = inputLogTopic.childKeys.map(
                (logKey) => LogStructureKey.save.call(this, logKey),
            );
        }
        let values;
        if (inputLogTopic.parentLogTopic && inputLogTopic.parentLogTopic.childKeys) {
            values = inputLogTopic.parentLogTopic.childKeys.map((logKey) => logKey.value || null);
        }
        const updated = {
            parent_topic_id: inputLogTopic.parentLogTopic
                ? inputLogTopic.parentLogTopic.__id__
                : null,
            ordering_index: orderingIndex,
            name: inputLogTopic.name,
            details: RichTextUtils.serialize(
                inputLogTopic.details,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            child_keys: childKeys ? JSON.stringify(childKeys) : null,
            values: values ? JSON.stringify(values) : null,
            child_count: 'invalid', // will be set below
            is_favorite: inputLogTopic.isFavorite,
            is_deprecated: inputLogTopic.isDeprecated,
        };

        DataTypeBase.broadcast.call(
            this,
            'log-topic-list',
            logTopic,
            { parent_topic_id: updated.parent_topic_id },
        );

        const shouldUpdateChildTopics = (
            original.child_keys !== updated.child_keys
        );
        let childLogTopics;
        if (shouldUpdateChildTopics) {
            childLogTopics = await this.invoke.call(
                this,
                'log-topic-list',
                { where: { parentLogTopic: inputLogTopic } },
            );
            updated.child_count = childLogTopics.length;
        } else {
            updated.child_count = await LogTopic.count.call(
                this,
                { parent_topic_id: inputLogTopic.__id__ },
            );
        }

        logTopic = await this.database.createOrUpdateItem('LogTopic', logTopic, updated);

        const targetLogTopics = LogTopic.extractLogTopics(inputLogTopic);
        await this.database.setEdges(
            'LogTopicToLogTopic',
            'source_topic_id',
            logTopic.id,
            'target_topic_id',
            Object.values(targetLogTopics).reduce((result, targetLogTopic) => {
                // eslint-disable-next-line no-param-reassign
                result[targetLogTopic.__id__] = {};
                return result;
            }, {}),
        );

        if (original.parent_topic_id !== updated.parent_topic_id) {
            // Update counts on parent log topics.
            const maybeUpdate = async (id) => {
                if (!id) {
                    return;
                }
                const parentLogTopic = await this.invoke.call(this, 'log-topic-load', { __id__: id });
                await this.invoke.call(this, 'log-topic-upsert', parentLogTopic);
            };
            await Promise.all([
                maybeUpdate(original.parent_topic_id),
                maybeUpdate(updated.parent_topic_id),
            ]);
        }

        if (original.name !== logTopic.name) {
            // Update names on references items.
            const outputLogTopic = await LogTopic.load.call(this, logTopic.id);
            await LogTopic.updateOtherEntities.call(
                this,
                'LogEventToLogTopic',
                outputLogTopic,
                'source_event_id',
                'log-event',
                ['title', 'details'],
                // TODO: What about structureValues?
            );
            await LogTopic.updateOtherEntities.call(
                this,
                'LogStructureToLogTopic',
                outputLogTopic,
                'source_structure_id',
                'log-structure',
                ['titleTemplate'],
            );
            await LogTopic.updateOtherEntities.call(
                this,
                'LogTopicToLogTopic',
                outputLogTopic,
                'source_topic_id',
                'log-topic',
                ['details'],
            );
        }

        if (shouldUpdateChildTopics) {
            await asyncSequence(childLogTopics, async (childLogTopic) => {
                // Update the childLogTopics to support logKey addition, reorder, deletion.
                const mapping = {};
                if (childLogTopic.parentLogTopic.childKeys) {
                    childLogTopic.parentLogTopic.childKeys.forEach((logKey) => {
                        mapping[logKey.__id__] = logKey;
                    });
                }
                childLogTopic.parentLogTopic = {
                    ...inputLogTopic,
                    childKeys: inputLogTopic.childKeys.map((logKey) => ({
                        ...logKey,
                        value: (mapping[logKey.__id__] || logKey).value,
                    })),
                };
                return this.invoke.call(this, 'log-topic-upsert', childLogTopic);
            });
        }

        return logTopic.id;
    }

    // TODO: Replace this with simple updates.
    // Each entity should be able to correct itself.
    static async updateOtherEntities(
        junctionTableName,
        updatedLogTopic,
        junctionSourceName,
        entityType,
        entityFieldNames,
    ) {
        const edges = await this.database.getEdges(
            junctionTableName,
            'target_topic_id',
            updatedLogTopic.__id__,
        );
        const inputItems = await Promise.all(
            edges.map((edge) => this.invoke.call(
                this,
                `${entityType}-load`,
                { __id__: edge[junctionSourceName] },
            )),
        );
        await Promise.all(
            inputItems.map((inputItem) => {
                entityFieldNames.forEach((entityFieldName) => {
                    inputItem[entityFieldName] = RichTextUtils.updateDraftContent(
                        inputItem[entityFieldName], [updatedLogTopic],
                    );
                });
                return this.invoke.call(this, `${entityType}-upsert`, inputItem);
            }),
        );
    }

    static async delete(id) {
        const logTopic = await this.database.deleteByPk('LogTopic', id);
        if (logTopic.parent_topic_id) {
            const parentLogTopic = await this.invoke.call(
                this,
                'log-topic-load',
                { __id__: logTopic.parent_topic_id },
            );
            await this.invoke.call(this, 'log-topic-upsert', parentLogTopic);
        }

        DataTypeBase.broadcast.call(this, 'log-topic-list', logTopic, ['parent_topic_id']);
        return { __id__: logTopic.id };
    }
}

export default LogTopic;
