import { getVirtualID } from './utils';
import DataTypeBase from './base';
import RichTextUtils from '../rich_text_utils';
import { validateNonEmptyString } from './validation';

class LogTopic extends DataTypeBase {
    static createVirtual({ parentLogTopic = null, name = '' } = {}) {
        return {
            __type__: 'log-topic',
            __id__: getVirtualID(),
            parentLogTopic,
            name,
            details: null,
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

    static async validate(inputLogTopic) {
        const results = [];
        results.push(validateNonEmptyString('.name', inputLogTopic.name));
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
            outputParentLogTopic = {
                __type__: 'log-topic',
                __id__: parentLogTopic.id,
                name: parentLogTopic.name,
            };
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
            childCount: logTopic.child_count,
            isFavorite: logTopic.is_favorite,
            isDeprecated: logTopic.is_deprecated,
        };
    }

    static async save(inputLogTopic) {
        let logTopic = await this.database.findItem('LogTopic', inputLogTopic);

        const oldParentTopicId = logTopic ? logTopic.parent_topic_id : null;
        const newParentTopicId = inputLogTopic.parentLogTopic
            ? inputLogTopic.parentLogTopic.__id__
            : null;
        DataTypeBase.broadcast.call(
            this,
            'log-topic-list',
            logTopic,
            { parent_topic_id: newParentTopicId },
        );

        const originalName = logTopic ? logTopic.name : null;
        const orderingIndex = await DataTypeBase.getOrderingIndex.call(this, logTopic);
        const childCount = await LogTopic.count.call(
            this,
            { parent_topic_id: inputLogTopic.__id__ },
        );
        const fields = {
            parent_topic_id: newParentTopicId,
            ordering_index: orderingIndex,
            name: inputLogTopic.name,
            details: RichTextUtils.serialize(
                inputLogTopic.details,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            child_count: childCount,
            is_favorite: inputLogTopic.isFavorite,
            is_deprecated: inputLogTopic.isDeprecated,
        };
        logTopic = await this.database.createOrUpdateItem('LogTopic', logTopic, fields);

        const targetLogTopics = RichTextUtils.extractMentions(inputLogTopic.details, 'log-topic');
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

        if (oldParentTopicId !== newParentTopicId) {
            // Update counts on parent log topics.
            const maybeUpdate = async (id) => {
                if (!id) {
                    return;
                }
                const parentLogTopic = await this.invoke.call(this, 'log-topic-load', { __id__: id });
                await this.invoke.call(this, 'log-topic-upsert', parentLogTopic);
            };
            await Promise.all([
                maybeUpdate(oldParentTopicId),
                maybeUpdate(newParentTopicId),
            ]);
        }

        if (originalName && originalName !== logTopic.name) {
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

        return logTopic.id;
    }

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
