import { getVirtualID } from './Utils';
import { updateDraftContent } from '../common/DraftContentUtils';
import Base from './Base';
import LogTopicGroup from './LogTopicGroup';
import TextEditorUtils from '../common/TextEditorUtils';

class LogTopic extends Base {
    static createVirtual({ logTopicGroup } = {}) {
        return {
            id: getVirtualID(),
            logTopicGroup,
            name: '',
            details: '',
            onSidebar: false,
        };
    }

    static async validateInternal(inputLogTopic) {
        const logTopicGroupResults = await this.validateRecursive(
            LogTopicGroup,
            '.logTopicGroup',
            inputLogTopic.logTopicGroup,
        );
        return [
            this.validateNonEmptyString('.name', inputLogTopic.name),
            ...logTopicGroupResults,
        ];
    }

    static async load(id) {
        const logTopic = await this.database.findByPk('LogTopic', id, this.transaction);
        const logTopicGroup = await this.database.findByPk(
            'LogTopicGroup',
            logTopic.group_id,
            this.transaction,
        );
        return {
            id: logTopic.id,
            logTopicGroup,
            name: logTopic.name,
            onSidebar: logTopic.on_sidebar,
            details: logTopic.details,
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
            group_id: inputLogTopic.logTopicGroup.id,
            ordering_index: orderingIndex,
            name: inputLogTopic.name,
            on_sidebar: inputLogTopic.onSidebar,
            details: inputLogTopic.details,
        };
        logTopic = await this.database.createOrUpdateItem(
            'LogTopic', logTopic, fields, this.transaction,
        );

        if (originalName && originalName !== logTopic.name) {
            const outputLogTopic = await LogTopic.load.call(this, logTopic.id);
            await LogTopic.updateLogEvents.call(this, outputLogTopic);
            await LogTopic.updateLogStructures.call(this, outputLogTopic);
            await LogTopic.updateLogReminders.call(this, outputLogTopic);
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

    static async updateLogReminders(updatedLogTopic) {
        const outputLogReminders = await this.invoke.call(this, 'log-reminder-list');
        await Promise.all(
            outputLogReminders.map((outputLogReminder) => {
                outputLogReminder.title = LogTopic.updateContent(
                    outputLogReminder.title, [updatedLogTopic],
                );
                return this.invoke.call(this, 'log-reminder-upsert', outputLogReminder);
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
        content = updateDraftContent(content, null, logTopics);
        return TextEditorUtils.serialize(
            content,
            TextEditorUtils.StorageType.DRAFTJS,
        );
    }
}

export default LogTopic;
