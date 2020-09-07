import { getVirtualID } from './Utils';
import Base from './Base';
import TextEditorUtils from '../common/TextEditorUtils';

class LogTopic extends Base {
    static createVirtual({ logMode = null, parentLogTopic = null, name = '' } = {}) {
        return {
            __type__: 'log-topic',
            id: getVirtualID(),
            logMode,
            parentLogTopic,
            name,
            details: null,
            isFavorite: false,
        };
    }

    static async updateWhere(where) {
        await Base.updateWhere.call(this, where, {
            id: 'id',
            isFavorite: 'is_favorite',
            parentLogTopic: 'parent_topic_id',
            logMode: 'mode_id',
        });
    }

    static trigger(logTopic) {
        if (logTopic.parentLogTopic) {
            logTopic.logMode = logTopic.parentLogTopic.logMode;
        }
    }

    static async validateInternal(inputLogTopic) {
        const results = [];
        results.push(Base.validateNonEmptyString('.name', inputLogTopic.name));
        return results;
    }

    static async load(id) {
        const logTopic = await this.database.findByPk('LogTopic', id);
        let outputParentLogTopic = null;
        const outputLogMode = await this.invoke.call(this, 'log-mode-load', { id: logTopic.mode_id });
        if (logTopic.parent_topic_id) {
            // Intentionally loading only partial data.
            const parentLogTopic = await this.database.findByPk(
                'LogTopic',
                logTopic.parent_topic_id,
            );
            outputParentLogTopic = {
                __type__: 'log-topic',
                id: parentLogTopic.id,
                name: parentLogTopic.name,
                logMode: outputLogMode,
            };
        }
        return {
            __type__: 'log-topic',
            id: logTopic.id,
            logMode: outputLogMode,
            parentLogTopic: outputParentLogTopic,
            name: logTopic.name,
            details: TextEditorUtils.deserialize(
                logTopic.details,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            isFavorite: logTopic.is_favorite,
        };
    }

    static async save(inputLogTopic) {
        let logTopic = await this.database.findItem('LogTopic', inputLogTopic);

        const parentTopicId = inputLogTopic.parentLogTopic
            ? inputLogTopic.parentLogTopic.id
            : null;
        Base.broadcast.call(
            this,
            'log-topic-list',
            logTopic,
            { parent_topic_id: parentTopicId },
        );

        const originalName = logTopic ? logTopic.name : null;
        const orderingIndex = await Base.getOrderingIndex.call(this, logTopic);
        const fields = {
            mode_id: inputLogTopic.logMode.id,
            parent_topic_id: parentTopicId,
            ordering_index: orderingIndex,
            name: inputLogTopic.name,
            details: TextEditorUtils.serialize(
                inputLogTopic.details,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            is_favorite: inputLogTopic.isFavorite,
        };
        logTopic = await this.database.createOrUpdateItem('LogTopic', logTopic, fields);

        const targetLogTopics = TextEditorUtils.extractMentions(inputLogTopic.details, 'log-topic');
        await this.database.setEdges(
            'LogTopicToLogTopic',
            'source_topic_id',
            logTopic.id,
            'target_topic_id',
            Object.values(targetLogTopics).reduce((result, targetLogTopic) => {
                // eslint-disable-next-line no-param-reassign
                result[targetLogTopic.id] = {};
                return result;
            }, {}),
        );

        if (originalName && originalName !== logTopic.name) {
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
            updatedLogTopic.id,
        );
        const inputItems = await Promise.all(
            edges.map((edge) => this.invoke.call(
                this,
                `${entityType}-load`,
                { id: edge[junctionSourceName] },
            )),
        );
        await Promise.all(
            inputItems.map((inputItem) => {
                entityFieldNames.forEach((entityFieldName) => {
                    inputItem[entityFieldName] = TextEditorUtils.updateDraftContent(
                        inputItem[entityFieldName], [updatedLogTopic],
                    );
                });
                return this.invoke.call(this, `${entityType}-upsert`, inputItem);
            }),
        );
    }

    static async delete(id) {
        const logTopic = await this.database.deleteByPk('LogTopic', id);
        Base.broadcast.call(this, 'log-topic-list', logTopic, ['parent_topic_id']);
        return { id: logTopic.id };
    }
}

export default LogTopic;
