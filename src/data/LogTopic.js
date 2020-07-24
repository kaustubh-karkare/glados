import { getVirtualID } from './Utils';
import Base from './Base';
import TextEditorUtils from '../common/TextEditorUtils';

class LogTopic extends Base {
    static createVirtual({ parentLogTopic, name, hasStructure }) {
        return {
            __type__: 'log-topic',
            id: getVirtualID(),
            parentLogTopic: parentLogTopic || null,
            name: name || '',
            details: '',
            onSidebar: false,
            hasStructure: typeof hasStructure !== 'undefined' ? hasStructure : false,
        };
    }

    static async validateInternal(inputLogTopic) {
        const results = [];
        results.push(Base.validateNonEmptyString('.name', inputLogTopic.name));
        return results;
    }

    static async load(id) {
        const logTopic = await this.database.findByPk('LogTopic', id, this.transaction);
        let outputParentLogTopic = null;
        if (logTopic.parent_topic_id) {
            const parentLogTopic = await this.database.findByPk(
                'LogTopic',
                logTopic.parent_topic_id,
                this.transaction,
            );
            outputParentLogTopic = {
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
            onSidebar: logTopic.on_sidebar,
            hasStructure: logTopic.has_structure,
        };
    }

    static async save(inputLogTopic) {
        let logTopic = await this.database.findItem(
            'LogTopic',
            inputLogTopic,
            this.transaction,
        );

        const originalName = logTopic ? logTopic.name : null;
        const orderingIndex = await Base.getOrderingIndex.call(this, logTopic);
        const fields = {
            id: inputLogTopic.id,
            parent_topic_id: inputLogTopic.parentLogTopic ? inputLogTopic.parentLogTopic.id : null,
            ordering_index: orderingIndex,
            name: inputLogTopic.name,
            details: inputLogTopic.details,
            on_sidebar: inputLogTopic.onSidebar,
            has_structure: inputLogTopic.hasStructure,
        };
        logTopic = await this.database.createOrUpdateItem(
            'LogTopic', logTopic, fields, this.transaction,
        );

        if (originalName && originalName !== logTopic.name) {
            const outputLogTopic = await LogTopic.load.call(this, logTopic.id);
            await LogTopic.updateLogEvents.call(this, outputLogTopic);
            await LogTopic.updateLogStructures.call(this, outputLogTopic);
            await LogTopic.updateLogTopics.call(this, outputLogTopic);
        }

        this.broadcast('log-topic-list');
        return logTopic.id;
    }

    static async updateLogEvents(updatedLogTopic) {
        const logEventEdges = await this.database.getEdges(
            'LogEventToLogTopic',
            'topic_id',
            updatedLogTopic.id,
            this.transaction,
        );
        const outputLogEvents = await Promise.all(
            logEventEdges.map(
                (edge) => this.invoke.call(this, 'log-event-load', { id: edge.event_id }),
            ),
        );
        await Promise.all(
            outputLogEvents.map((outputLogEvent) => {
                outputLogEvent.title = LogTopic.updateContent(
                    outputLogEvent.title, [updatedLogTopic],
                );
                outputLogEvent.details = LogTopic.updateContent(
                    outputLogEvent.details, [updatedLogTopic],
                );
                return this.invoke.call(this, 'log-event-upsert', outputLogEvent);
            }),
        );
    }

    static async updateLogStructures(updatedLogTopic) {
        const outputLogStructures = await this.invoke.call(this, 'log-structure-list');
        await Promise.all(
            outputLogStructures.map((outputLogStructure) => {
                outputLogStructure.titleTemplate = LogTopic.updateContent(
                    outputLogStructure.titleTemplate, [updatedLogTopic],
                );
                return this.invoke.call(this, 'log-structure-upsert', outputLogStructure);
            }),
        );
    }

    static async updateLogTopics(updatedLogTopic) {
        const outputLogTopics = await this.invoke.call(this, 'log-topic-list');
        await Promise.all(
            outputLogTopics.map((outputLogTopic) => {
                outputLogTopic.details = LogTopic.updateContent(
                    outputLogTopic.details, [updatedLogTopic],
                );
                return this.invoke.call(this, 'log-topic-upsert', outputLogTopic);
            }),
        );
    }

    static updateContent(value, logTopics) {
        let content = TextEditorUtils.deserialize(
            value,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        content = TextEditorUtils.updateDraftContent(content, logTopics, logTopics);
        return TextEditorUtils.serialize(
            content,
            TextEditorUtils.StorageType.DRAFTJS,
        );
    }
}

export default LogTopic;
