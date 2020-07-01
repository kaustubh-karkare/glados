import { getVirtualID } from './Utils';
import { updateDraftContent } from '../common/DraftContentUtils';
import Base from './Base';
import LogTopicGroup from './LogTopicGroup';
import TextEditorUtils from '../common/TextEditorUtils';

class LogTopic extends Base {
    static createVirtual({ logTopicGroup } = {}) {
        return {
            id: getVirtualID(),
            logTopicGroup: LogTopicGroup.createVirtual(logTopicGroup),
            name: '',
            details: '',
        };
    }

    static async validateInternal(inputLogTopic) {
        return [
            this.validateNonEmptyString('.name', inputLogTopic.name),
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
            details: inputLogTopic.details,
        };
        logTopic = await this.database.createOrUpdateItem(
            'LogTopic', logTopic, fields, this.transaction,
        );

        if (originalName && originalName !== logTopic.name) {
            const outputLogTopic = await LogTopic.load.call(this, logTopic.id);
            await LogTopic.updateLogEntries.call(this, outputLogTopic);
            await LogTopic.updateLogStructures.call(this, outputLogTopic);
            await LogTopic.updateLogRemindeers.call(this, outputLogTopic);
        }

        this.broadcast('log-topic-list');
        return logTopic.id;
    }

    static async updateLogEntries(outputLogTopic) {
        const logEntryEdges = await this.database.getEdges(
            'LogEntryToLogTopic',
            'topic_id',
            outputLogTopic.id,
            this.transaction,
        );
        const outputLogEntries = await Promise.all(
            logEntryEdges.map(
                (edge) => this.invoke.call(this, 'log-entry-load', { id: edge.entry_id }),
            ),
        );
        await Promise.all(
            outputLogEntries.map((outputLogEntry) => {
                outputLogEntry.title = LogTopic.updateLogTopics(
                    outputLogEntry.title, [outputLogTopic],
                );
                outputLogEntry.details = LogTopic.updateLogTopics(
                    outputLogEntry.details, [outputLogTopic],
                );
                return this.invoke.call(this, 'log-entry-upsert', outputLogEntry);
            }),
        );
    }

    static async updateLogStructures(outputLogTopic) {
        const outputLogStructures = await this.invoke.call(this, 'log-structure-list');
        await Promise.all(
            outputLogStructures.map((outputLogStructure) => {
                outputLogStructure.titleTemplate = LogTopic.updateLogTopics(
                    outputLogStructure.titleTemplate, [outputLogTopic],
                );
                return this.invoke.call(this, 'log-structure-upsert', outputLogStructure);
            }),
        );
    }

    static async updateLogRemindeers(outputLogTopic) {
        const outputLogReminders = await this.invoke.call(this, 'log-reminder-list');
        await Promise.all(
            outputLogReminders.map((outputLogReminder) => {
                outputLogReminder.title = LogTopic.updateLogTopics(
                    outputLogReminder.title, [outputLogTopic],
                );
                return this.invoke.call(this, 'log-reminder-upsert', outputLogReminder);
            }),
        );
    }

    static updateLogTopics(value, logTopics) {
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
