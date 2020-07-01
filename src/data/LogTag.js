import { getVirtualID } from './Utils';
import { updateDraftContent } from '../common/DraftContentUtils';
import Base from './Base';
import TextEditorUtils from '../common/TextEditorUtils';

const LogTagTypes = {
    person: {
        label: 'Person',
        trigger: '@',
    },
    hashtag: {
        label: 'Hashtag',
        trigger: '#',
    },
};

function updateLogTag(value, logTag) {
    let content = TextEditorUtils.deserialize(
        value,
        TextEditorUtils.StorageType.DRAFTJS,
    );
    content = updateDraftContent(content, null, [logTag]);
    return TextEditorUtils.serialize(
        content,
        TextEditorUtils.StorageType.DRAFTJS,
    );
}

class LogTag extends Base {
    static createVirtual() {
        return {
            id: getVirtualID(),
            type: 'hashtag',
            name: '',
        };
    }

    static getTypes() {
        return Object.keys(LogTagTypes).map(
            (type) => ({ ...LogTagTypes[type], value: type }),
        );
    }

    static async validateInternal(inputLogTag) {
        return [
            this.validateNonEmptyString('.name', inputLogTag.name),
            this.validateEnumValue('.type', inputLogTag.type, LogTagTypes),
        ];
    }

    static async load(id) {
        const logTag = await this.database.findByPk('LogTag', id, this.transaction);
        return {
            id: logTag.id,
            type: logTag.type,
            name: logTag.name,
        };
    }

    static async save(inputLogTag) {
        let logTag = await this.database.findItem(
            'LogTag',
            inputLogTag,
            this.transaction,
        );
        const originalName = logTag ? logTag.name : null;
        const fields = {
            id: inputLogTag.id,
            type: inputLogTag.type,
            name: inputLogTag.name,
        };
        logTag = await this.database.createOrUpdateItem(
            'LogTag', logTag, fields, this.transaction,
        );

        if (originalName && originalName !== logTag.name) {
            const outputLogTag = await LogTag.load.call(this, logTag.id);
            await LogTag.updateLogEntries.call(this, outputLogTag);
            await LogTag.updateLogStructures.call(this, outputLogTag);
            await LogTag.updateLogRemindeers.call(this, outputLogTag);
        }

        this.broadcast('log-tag-list');
        return logTag.id;
    }

    static async updateLogEntries(outputLogTag) {
        const logEntryEdges = await this.database.getEdges(
            'LogEntryToLogTag',
            'tag_id',
            outputLogTag.id,
            this.transaction,
        );
        const outputLogEntries = await Promise.all(
            logEntryEdges.map(
                (edge) => this.invoke.call(this, 'log-entry-load', { id: edge.entry_id }),
            ),
        );
        await Promise.all(
            outputLogEntries.map((outputLogEntry) => {
                outputLogEntry.title = updateLogTag(outputLogEntry.title, outputLogTag);
                outputLogEntry.details = updateLogTag(outputLogEntry.details, outputLogTag);
                return this.invoke.call(this, 'log-entry-upsert', outputLogEntry);
            }),
        );
    }

    static async updateLogStructures(outputLogTag) {
        const outputLogStructures = await this.invoke.call(this, 'log-structure-list');
        await Promise.all(
            outputLogStructures.map((outputLogStructure) => {
                outputLogStructure.titleTemplate = updateLogTag(
                    outputLogStructure.titleTemplate, outputLogTag,
                );
                return this.invoke.call(this, 'log-structure-upsert', outputLogStructure);
            }),
        );
    }

    static async updateLogRemindeers(outputLogTag) {
        const outputLogReminders = await this.invoke.call(this, 'log-reminder-list');
        await Promise.all(
            outputLogReminders.map((outputLogReminder) => {
                outputLogReminder.title = updateLogTag(outputLogReminder.title, outputLogTag);
                return this.invoke.call(this, 'log-reminder-upsert', outputLogReminder);
            }),
        );
    }
}

export default LogTag;
