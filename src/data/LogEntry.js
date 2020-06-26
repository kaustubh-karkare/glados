
import assert from '../common/assert';
import Base from './Base';
import LogReminder from './LogReminder';
import LogStructure from './LogStructure';
import LogValue from './LogValue';
import { extractLogTags, substituteValuesIntoDraftContent } from '../common/TemplateUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import { INCOMPLETE_KEY, getVirtualID, isRealItem } from './Utils';


class LogEntry extends Base {
    static createVirtual({ date, logStructure } = {}) {
        logStructure = logStructure || LogStructure.createVirtual();
        return {
            __type__: 'log-entry',
            date: date || null,
            dateOrderingIndex: 0,
            id: getVirtualID(),
            name: '',
            title: '',
            details: '',
            logStructure,
            logValues: logStructure.logKeys.map((logKey) => LogValue.createVirtual({ logKey })),
            logReminder: null,
        };
    }

    static trigger(logEntry) {
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
        }
        logEntry.name = TextEditorUtils.extractPlainText(logEntry.title);
    }

    static async typeahead({ query }) {
        if (!query) {
            return LogStructure.typeahead.call(this, { query });
        }
        const where = {
            name: { [this.database.Op.like]: `${query}%` },
        };
        const logEntries = await this.database.findAll('LogEntry', where, this.transaction);
        return logEntries.map((logEntry) => ({
            __type__: 'log-entry',
            id: logEntry.id,
            name: logEntry.name,
            [INCOMPLETE_KEY]: true,
        }));
    }

    static async validateInternal(inputLogEntry) {
        const results = [];
        if (inputLogEntry.date !== null) {
            /*
            results.push(this.validateDateLabel('.date', inputLogEntry.date));
            results.push(
                this.validateIndex('.dateOrderingIndex', inputLogEntry.dateOrderingIndex),
            );
            */
        }
        results.push(this.validateNonEmptyString('.title', inputLogEntry.name));
        if (isRealItem(inputLogEntry.logStructure)) {
            const logStructureResults = await this.validateRecursive(
                LogStructure, '.logStructure', inputLogEntry.logStructure,
            );
            results.push(...logStructureResults);
        }
        const logValuesResults = await this.validateRecursiveList(
            LogValue, '.logValues', inputLogEntry.logValues,
        );
        results.push(...logValuesResults);
        if (inputLogEntry.logReminder !== null) {
            const logReminderResults = await this.validateRecursive(
                LogReminder, '.logReminder', inputLogEntry.logReminder,
            );
            results.push(...logReminderResults);
        }
        return results;
    }

    static async load(id) {
        const logEntry = await this.database.findByPk('LogEntry', id, this.transaction);
        // TODO: Parallelize the following operations.
        let outputLogStructure;
        if (logEntry.structure_id) {
            outputLogStructure = await LogStructure.load.call(this, logEntry.structure_id);
        } else {
            outputLogStructure = LogStructure.createVirtual();
        }
        const edges = await this.database.getEdges(
            'LogEntryToLogValue',
            'entry_id',
            logEntry.id,
            this.transaction,
        );
        const outputLogValues = await Promise.all(
            edges.map((edge) => LogValue.load.call(this, edge.value_id)),
        );
        const logReminder = await this.database.findOne('LogReminder', { entry_id: id }, this.transaction);
        let outputLogReminder = null;
        if (logReminder) {
            outputLogReminder = await LogReminder.load.call(this, logReminder.id);
            delete outputLogReminder.entry_id;
        }
        return {
            __type__: 'log-entry',
            id: logEntry.id,
            date: logEntry.date,
            dateOrderingIndex: logEntry.date_ordering_index,
            name: logEntry.name,
            title: logEntry.title,
            details: logEntry.details,
            logStructure: outputLogStructure, // TODO: Create empty if needed.
            logValues: outputLogValues,
            logReminder: outputLogReminder,
        };
    }

    static async save(inputLogEntry) {
        let logStructure = null;
        if (isRealItem(inputLogEntry.logStructure)) {
            logStructure = await this.database.findByPk('LogStructure', inputLogEntry.logStructure.id);
            const logStructureKeys = await this.database.getNodesByEdge(
                'LogStructureToLogKey',
                'structure_id',
                logStructure.id,
                'key_id',
                'LogKey',
                this.transaction,
            );
            assert(
                logStructureKeys.map((logKey) => logKey.id).equals(
                    inputLogEntry.logValues.map((logValue) => logValue.logKey.id),
                ),
                `${'Missing keys for selected structure!'
                    + '\nExpected = '}${logStructureKeys.map((logKey) => logKey.name).join(', ')
                }\nActual = ${inputLogEntry.logValues.map((logValue) => logValue.logKey.name).join(', ')}`,
            );
        }

        LogEntry.trigger(inputLogEntry);
        const fields = {
            id: inputLogEntry.id,
            date: inputLogEntry.date,
            date_ordering_index: inputLogEntry.dateOrderingIndex,
            name: inputLogEntry.name,
            title: inputLogEntry.title,
            structure_id: logStructure ? logStructure.id : null,
            details: inputLogEntry.details,
        };
        const logEntry = await this.database.createOrUpdate('LogEntry', fields, this.transaction);

        const logValues = await Promise.all(
            inputLogEntry.logValues.map(async (inputLogValue) => {
                const logKey = await this.database.createOrFind(
                    'LogKey',
                    { name: inputLogValue.logKey.name },
                    { type: inputLogValue.logKey.type },
                    this.transaction,
                );
                assert(logKey.type === inputLogValue.logKey.type, 'Mismatched key type!');
                const logValue = await this.database.createOrFind(
                    'LogValue',
                    { key_id: logKey.id, data: inputLogValue.data },
                    {},
                    this.transaction,
                );
                logValue.logKey = logKey;
                return logValue;
            }),
        );

        const deletedEdges = await this.database.setEdges(
            'LogEntryToLogValue',
            'entry_id',
            logEntry.id,
            'value_id',
            logValues.reduce((result, logValue, index) => {
                // eslint-disable-next-line no-param-reassign
                result[logValue.id] = { ordering_index: index };
                return result;
            }, {}),
            this.transaction,
        );
        await LogEntry.deleteValues.call(this, deletedEdges.map((edge) => edge.value_id));

        const logTags = {
            ...extractLogTags(
                TextEditorUtils.deserialize(
                    logEntry.title,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
            ),
            ...extractLogTags(
                TextEditorUtils.deserialize(
                    logEntry.details,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
            ),
        };
        await this.database.setEdges(
            'LogEntryToLogTag',
            'entry_id',
            logEntry.id,
            'tag_id',
            Object.values(logTags).reduce((result, logTag) => {
                // eslint-disable-next-line no-param-reassign
                result[logTag.id] = {};
                return result;
            }, {}),
            this.transaction,
        );

        const logReminder = await this.database.findOne(
            'LogReminder',
            { entry_id: logEntry.id },
            this.transaction,
        );
        if (inputLogEntry.logReminder) {
            await LogReminder.save.call(this, {
                id: logReminder ? logReminder.id : getVirtualID(),
                entry_id: logEntry.id,
                ...inputLogEntry.logReminder,
            });
        } else if (logReminder) {
            await LogReminder.delete.call(this, logReminder.id);
        }

        return logEntry.id;
    }

    static async delete(id) {
        const deletedEdges = await this.database.getEdges(
            'LogEntryToLogValue',
            'entry_id',
            id,
            this.transaction,
        );
        const result = await Base.delete.call(this, id);
        await LogEntry.deleteValues.call(this, deletedEdges.map((edge) => edge.value_id));
        return result;
    }

    static async deleteValues(logValueIds) {
        if (!logValueIds.length) {
            return;
        }
        const countResults = {};
        logValueIds.forEach((valueId) => {
            countResults[valueId] = 0;
        });
        const logValueCounts = await this.database.count(
            'LogEntryToLogValue',
            {
                value_id: {
                    [this.database.Op.in]: logValueIds,
                },
            },
            ['value_id'],
            this.transaction,
        );
        logValueCounts.forEach((item) => {
            countResults[item.value_id] += item.count;
        });
        const deletedLogValues = await Promise.all(
            Object.entries(countResults)
                .filter(([_, count]) => count === 0)
                .map(([valueId]) => this.database.deleteByPk(
                    'LogValue',
                    valueId,
                    this.transaction,
                )),
        );
        const logKeyIds = deletedLogValues.map((logValue) => logValue.key_id);
        await LogStructure.deleteKeys.call(this, logKeyIds);
    }
}

export default LogEntry;
