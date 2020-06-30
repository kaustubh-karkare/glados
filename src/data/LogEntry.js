
import assert from '../common/assert';
import Base from './Base';
import LogStructure from './LogStructure';
import LogValue from './LogValue';
import { extractLogTags, substituteValuesIntoDraftContent } from '../common/TemplateUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import { getVirtualID, isRealItem } from './Utils';


class LogEntry extends Base {
    static createVirtual({ date, logStructure } = {}) {
        logStructure = logStructure || LogStructure.createVirtual();
        return {
            __type__: 'log-entry',
            date: date || null,
            orderingIndex: null,
            id: getVirtualID(),
            name: '',
            title: '',
            details: '',
            logStructure,
            logValues: logStructure.logKeys.map((logKey) => LogValue.createVirtual({ logKey })),
        };
    }

    static trigger(logEntry) {
        if (isRealItem(logEntry.logStructure)) {
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
        return {
            __type__: 'log-entry',
            id: logEntry.id,
            date: logEntry.date,
            orderingIndex: logEntry.ordering_index,
            name: logEntry.name,
            title: logEntry.title,
            details: logEntry.details,
            logStructure: outputLogStructure, // TODO: Create empty if needed.
            logValues: outputLogValues,
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

        // TODO: Reuse read results from below?
        let logEntry;
        if (isRealItem(inputLogEntry)) {
            logEntry = await this.database.findByPk(
                'LogEntry',
                inputLogEntry.id,
                this.transaction,
            );
        }

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

        LogEntry.trigger(inputLogEntry);
        const orderingIndex = await Base.getOrderingIndex
            .call(this, { date: inputLogEntry.date });
        const fields = {
            date: inputLogEntry.date,
            ordering_index: orderingIndex,
            name: inputLogEntry.name,
            title: inputLogEntry.title,
            details: inputLogEntry.details,
            structure_id: logStructure ? logStructure.id : null,
        };
        if (logEntry) {
            logEntry = await logEntry.update(fields, { transaction: this.transaction });
        } else {
            logEntry = await this.database.create('LogEntry', fields, this.transaction);
        }

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
        const countResults = {};
        logValueIds.forEach((keyId) => {
            countResults[keyId] = 0;
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
            countResults[item.key_id] += item.count;
        });
        await Promise.all(
            Object.entries(countResults)
                .filter(([_, count]) => count === 0)
                .map(([valueId]) => this.database.deleteByPk(
                    'LogValue',
                    valueId,
                    this.transaction,
                )),
        );
    }
}

export default LogEntry;
