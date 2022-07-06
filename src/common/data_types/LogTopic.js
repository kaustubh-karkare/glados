import { asyncSequence } from '../AsyncUtils';
import RichTextUtils from '../RichTextUtils';
import DataTypeBase from './base';
import LogKey from './LogKey';
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

    static trigger(inputLogTopic) {
        if (inputLogTopic.parentLogTopic && inputLogTopic.parentLogTopic.childNameTemplate) {
            const { childKeys } = inputLogTopic.parentLogTopic;
            inputLogTopic.name = RichTextUtils.extractPlainText(
                RichTextUtils.updateDraftContent(
                    inputLogTopic.parentLogTopic.childNameTemplate,
                    childKeys,
                    childKeys.map((logKey) => logKey.value || (logKey.isOptional ? '' : logKey)),
                    true, // evaluateExpressions
                ),
            );
        }
        // Do nothing by default.
    }

    static async updateLogTopicInDetails(inputLogTopic) {
        const originalLogTopics = Object.values(
            RichTextUtils.extractMentions(inputLogTopic.details, 'log-topic'),
        );
        const updatedLogTopics = await Promise.all(
            originalLogTopics.map((originalTopic) => this.invoke.call(
                this,
                'log-topic-load-partial',
                originalTopic,
            )),
        );
        inputLogTopic.details = RichTextUtils.updateDraftContent(
            inputLogTopic.details,
            originalLogTopics,
            updatedLogTopics,
        );
        return updatedLogTopics.map((logTopic) => logTopic.__id__);
    }

    static async updateLogTopics(inputLogTopic) {
        const promises = [];
        promises.push(LogTopic.updateLogTopicInDetails.call(this, inputLogTopic));
        if (inputLogTopic.parentLogTopic && inputLogTopic.parentLogTopic.childKeys) {
            inputLogTopic.parentLogTopic.childKeys.forEach((inputLogKey) => {
                promises.push(LogKey.updateLogTopics.call(this, inputLogKey));
            });
        }
        const listOfTopicIDs = await Promise.all(promises);
        return listOfTopicIDs.flat();
    }

    static async validate(inputLogTopic) {
        const results = [];
        results.push(validateNonEmptyString('.name', inputLogTopic.name));

        if (inputLogTopic.childKeys) {
            results.push(...await validateRecursiveList.call(
                this,
                LogKey,
                '.childKeys',
                inputLogTopic.childKeys,
            ));
        }

        if (inputLogTopic.parentLogTopic && inputLogTopic.parentLogTopic.childKeys) {
            const logKeyResults = await Promise.all(
                inputLogTopic.parentLogTopic.childKeys.map(
                    async (inputLogKey, index) => LogKey.validateValue.call(
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

    static async loadPartial(id) {
        const logTopic = await this.database.findByPk('LogTopic', id);
        return {
            __type__: 'log-topic',
            __id__: logTopic.id,
            name: logTopic.name,
        };
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
                        (logKey, index) => LogKey.load.call(this, logKey, index + 1),
                    ),
                );
                const parentValues = JSON.parse(logTopic.parent_values);
                outputParentChildKeys.forEach((logKey, index) => {
                    logKey.value = parentValues[index] || null;
                });
            }
            outputParentLogTopic = {
                __type__: 'log-topic',
                __id__: parentLogTopic.id,
                name: parentLogTopic.name,
                childKeys: outputParentChildKeys,
                childNameTemplate: RichTextUtils.deserialize(
                    parentLogTopic.child_name_template,
                    RichTextUtils.StorageType.DRAFTJS,
                ),
            };
        }
        let outputChildKeys = null;
        if (logTopic.child_keys) {
            outputChildKeys = await Promise.all(
                JSON.parse(logTopic.child_keys).map(
                    (logKey, index) => LogKey.load.call(this, logKey, index + 1),
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
            childNameTemplate: RichTextUtils.deserialize(
                logTopic.child_name_template,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            childCount: logTopic.child_count,
            isFavorite: logTopic.is_favorite,
            isDeprecated: logTopic.is_deprecated,
        };
    }

    static async save(inputLogTopic) {
        let logTopic = await this.database.findItem('LogTopic', inputLogTopic);

        const original = {};
        if (logTopic) {
            original.id = logTopic.id;
            original.name = logTopic.name;
            original.parent_topic_id = logTopic.parent_topic_id;
            original.child_name_template = logTopic.child_name_template;
            original.child_keys = logTopic.child_keys;
        }

        if (original.id && original.name !== inputLogTopic.name) {
            // Update the name first, so that all referencing items
            // that reference this topic can see the new name.
            await this.database.update('LogTopic', {
                id: original.id,
                name: inputLogTopic.name,
            });
        }
        // Before the serialization process, since the input is modified.
        const targetLogTopicIDs = await LogTopic.updateLogTopics.call(this, inputLogTopic);

        const orderingIndex = await DataTypeBase.getOrderingIndex.call(this, logTopic);
        let childKeys;
        if (inputLogTopic.childKeys) {
            childKeys = inputLogTopic.childKeys.map(
                (logKey) => LogKey.save.call(this, logKey),
            );
        }
        let parentValues;
        if (inputLogTopic.parentLogTopic && inputLogTopic.parentLogTopic.childKeys) {
            parentValues = inputLogTopic.parentLogTopic.childKeys.map(
                (logKey) => logKey.value || null,
            );
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
            child_name_template: RichTextUtils.serialize(
                inputLogTopic.childNameTemplate,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            parent_values: parentValues ? JSON.stringify(parentValues) : null,
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

        let shouldUpdateChildTopics = false;
        if (!shouldUpdateChildTopics && original.child_keys !== updated.child_keys) {
            shouldUpdateChildTopics = true;
        }
        if (!shouldUpdateChildTopics) {
            const originalChildNameTemplate = RichTextUtils.deserialize(
                original.child_name_template,
                RichTextUtils.StorageType.DRAFTJS,
            );
            if (!RichTextUtils.equals(originalChildNameTemplate, inputLogTopic.childNameTemplate)) {
                shouldUpdateChildTopics = true;
            }
        }
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

        await this.database.setEdges(
            'LogTopicToLogTopic',
            'source_topic_id',
            logTopic.id,
            'target_topic_id',
            Object.values(targetLogTopicIDs).reduce((result, topicID) => {
                // eslint-disable-next-line no-param-reassign
                result[topicID] = {};
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

        if (original.id && original.name !== updated.name) {
            // Update names on references items.
            await Promise.all([
                LogTopic.updateOtherEntities.call(
                    this,
                    'LogEventToLogTopic',
                    logTopic.id,
                    'source_event_id',
                    'log-event',
                ),
                LogTopic.updateOtherEntities.call(
                    this,
                    'LogStructureToLogTopic',
                    logTopic.id,
                    'source_structure_id',
                    'log-structure',
                ),
                LogTopic.updateOtherEntities.call(
                    this,
                    'LogTopicToLogTopic',
                    logTopic.id,
                    'source_topic_id',
                    'log-topic',
                ),
            ]);
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

        await this.invoke.call(
            this,
            'topic-value-typeahead-index-$refresh',
            { parent_topic_id: logTopic.parent_topic_id },
        );

        return logTopic.id;
    }

    static async updateOtherEntities(
        junctionTableName,
        targetTopicID,
        junctionSourceName,
        entityType,
    ) {
        const edges = await this.database.getEdges(
            junctionTableName,
            'target_topic_id',
            targetTopicID,
        );
        const inputItems = await Promise.all(
            edges.map((edge) => this.invoke.call(
                this,
                `${entityType}-load`,
                { __id__: edge[junctionSourceName] },
            )),
        );
        await Promise.all(inputItems.map(
            (inputItem) => this.invoke.call(this, `${entityType}-upsert`, inputItem),
        ));
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
        await this.invoke.call(
            this,
            'topic-value-typeahead-index-$refresh',
            { parent_topic_id: logTopic.parent_topic_id },
        );
        return { __id__: logTopic.id };
    }
}

export default LogTopic;
