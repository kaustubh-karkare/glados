import { getVirtualID } from './Utils';
import Base from './Base';
import TextEditorUtils from '../common/TextEditorUtils';

class LogTopic extends Base {
    static createVirtual({ parentLogTopic = null, name = '' } = {}) {
        return {
            __type__: 'log-topic',
            id: getVirtualID(),
            parentLogTopic,
            name,
            details: '',
            isFavorite: false,
        };
    }

    static async updateWhere(where) {
        await Base.updateWhere.call(this, where, {
            id: 'id',
            isFavorite: 'is_favorite',
            parentLogTopic: 'parent_topic_id',
        });
    }

    static async validateInternal(inputLogTopic) {
        const results = [];
        results.push(Base.validateNonEmptyString('.name', inputLogTopic.name));
        return results;
    }

    static async load(id) {
        const logTopic = await this.database.findByPk('LogTopic', id);
        let outputParentLogTopic = null;
        if (logTopic.parent_topic_id) {
            const parentLogTopic = await this.database.findByPk(
                'LogTopic',
                logTopic.parent_topic_id,
            );
            outputParentLogTopic = {
                __type__: 'log-topic',
                id: parentLogTopic.id,
                name: parentLogTopic.name,
            };
        }
        return {
            __type__: 'log-topic',
            id: logTopic.id,
            parentLogTopic: outputParentLogTopic,
            name: logTopic.name,
            details: logTopic.details,
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
            id: inputLogTopic.id,
            parent_topic_id: parentTopicId,
            ordering_index: orderingIndex,
            name: inputLogTopic.name,
            details: inputLogTopic.details,
            is_favorite: inputLogTopic.isFavorite,
        };
        logTopic = await this.database.createOrUpdateItem('LogTopic', logTopic, fields);

        const updatedDetails = TextEditorUtils.deserialize(
            logTopic.details,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        const targetLogTopics = TextEditorUtils.extractMentions(updatedDetails, 'log-topic');
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
                    inputItem[entityFieldName] = LogTopic.updateContent(
                        inputItem[entityFieldName], [updatedLogTopic],
                    );
                });
                return this.invoke.call(this, `${entityType}-upsert`, inputItem);
            }),
        );
    }

    static updateContent(value, oldLogTopics, newLogTopics = null) {
        let content = TextEditorUtils.deserialize(
            value,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        content = TextEditorUtils.updateDraftContent(
            content,
            oldLogTopics,
            newLogTopics || oldLogTopics,
        );
        return TextEditorUtils.serialize(
            content,
            TextEditorUtils.StorageType.DRAFTJS,
        );
    }

    static async delete(id) {
        const logTopic = await this.database.deleteByPk('LogTopic', id);
        Base.broadcast.call(this, 'log-topic-list', logTopic, ['parent_topic_id']);
        return { id: logTopic.id };
    }
}

export default LogTopic;
