
import Base from './Base';
import LogStructure from './LogStructure';
import { extractLogTopics, substituteValuesIntoDraftContent } from '../common/DraftContentUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import { getVirtualID } from './Utils';


class LogEntry extends Base {
    static createVirtual({ date, title, logStructure } = {}) {
        return {
            __type__: 'log-entry',
            date: date || null,
            orderingIndex: null,
            id: getVirtualID(),
            name: '',
            title: title || '',
            details: '',
            logStructure: logStructure || null,
            logValues: logStructure ? logStructure.logKeys.map((logKey) => '') : null,
        };
    }

    static trigger(logEntry) {
        if (logEntry.logStructure) {
            if (logEntry.logStructure.titleTemplate) {
                const content = TextEditorUtils.deserialize(
                    logEntry.logStructure.titleTemplate,
                    TextEditorUtils.StorageType.DRAFTJS,
                );
                const plaintext = substituteValuesIntoDraftContent(
                    content,
                    logEntry.logValues,
                );
                logEntry.title = TextEditorUtils.serialize(
                    plaintext,
                    TextEditorUtils.StorageType.PLAINTEXT,
                );
            } else {
                logEntry.title = TextEditorUtils.serialize(
                    logEntry.logStructure.name,
                    TextEditorUtils.StorageType.PLAINTEXT,
                );
            }
        }
        logEntry.name = TextEditorUtils.extractPlainText(logEntry.title);
    }

    static async validateInternal(inputLogEntry) {
        const results = [];
        if (inputLogEntry.date !== null) {
            results.push(this.validateDateLabel('.date', inputLogEntry.date));
        }
        results.push(this.validateNonEmptyString('.title', inputLogEntry.name));
        if (inputLogEntry.logStructure) {
            const logStructureResults = await this.validateRecursive(
                LogStructure, '.logStructure', inputLogEntry.logStructure,
            );
            results.push(...logStructureResults);

            inputLogEntry.logValues.forEach((logValue, index) => {
                // const logKey = inputLogEntry.logStructure.logKeys[index];
                const prefix = `.logValues[${index}]`;
                // TODO: Validate data using logKey
                results.push(this.validateNonEmptyString(prefix, logValue));
            });
        }
        return results;
    }

    static async load(id) {
        const logEntry = await this.database.findByPk('LogEntry', id, this.transaction);
        let outputLogStructure = null;
        let outputLogValues = null;
        if (logEntry.structure_id) {
            outputLogStructure = await LogStructure.load.call(this, logEntry.structure_id);
            outputLogValues = JSON.parse(logEntry.structure_values);
        }
        return {
            __type__: 'log-entry',
            id: logEntry.id,
            date: logEntry.date,
            orderingIndex: logEntry.ordering_index,
            name: logEntry.name,
            title: logEntry.title,
            details: logEntry.details,
            logStructure: outputLogStructure,
            logValues: outputLogValues,
        };
    }

    static async save(inputLogEntry) {
        let logEntry = await this.database.findItem(
            'LogEntry',
            inputLogEntry,
            this.transaction,
        );

        if (logEntry && logEntry.date && logEntry.date !== inputLogEntry.date) {
            this.broadcast('log-entry-list', {
                selector: { date: logEntry.date },
            });
        }
        if (inputLogEntry.date && (logEntry ? inputLogEntry.date !== logEntry.date : true)) {
            this.broadcast('log-entry-list', {
                selector: { date: inputLogEntry.date },
            });
        }

        // TODO(broadcast): Make this more specific!
        this.broadcast('log-entry-list'); // Update all lists!

        const orderingIndex = await Base.getOrderingIndex
            .call(this, logEntry, { date: inputLogEntry.date });
        const fields = {
            date: inputLogEntry.date,
            ordering_index: orderingIndex,
            name: inputLogEntry.name,
            title: inputLogEntry.title,
            details: inputLogEntry.details,
            structure_id: inputLogEntry.logStructure ? inputLogEntry.logStructure.id : null,
            structure_values: inputLogEntry.logStructure
                ? JSON.stringify(inputLogEntry.logValues)
                : null,
        };
        logEntry = await this.database.createOrUpdateItem(
            'LogEntry', logEntry, fields, this.transaction,
        );

        const logTopics = {
            ...extractLogTopics(
                TextEditorUtils.deserialize(
                    logEntry.title,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
            ),
            ...extractLogTopics(
                TextEditorUtils.deserialize(
                    logEntry.details,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
            ),
        };
        await this.database.setEdges(
            'LogEntryToLogTopic',
            'entry_id',
            logEntry.id,
            'topic_id',
            Object.values(logTopics).reduce((result, logTopic) => {
                // eslint-disable-next-line no-param-reassign
                result[logTopic.id] = {};
                return result;
            }, {}),
            this.transaction,
        );

        return logEntry.id;
    }
}

export default LogEntry;
