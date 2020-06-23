
import assert from '../common/assert';
import Base from './Base';
import LogCategory, { materializeCategoryTemplate } from './LogCategory';
import LogValue from './LogValue';
import TextEditorUtils from '../common/TextEditorUtils';
import { INCOMPLETE_KEY, getVirtualID, isRealItem } from './Utils';


class LogEntry extends Base {
    static createVirtual(logCategory) {
        logCategory = logCategory || LogCategory.createVirtual();
        return {
            __type__: 'log-entry',
            id: getVirtualID(),
            name: '',
            title: '',
            logCategory,
            logValues: logCategory.logKeys.map((logKey) => LogValue.createVirtual(logKey)),
            details: '',
        };
    }

    static trigger(logEntry) {
        if (logEntry.logCategory.template) {
            logEntry.title = materializeCategoryTemplate(
                logEntry.logCategory.template,
                logEntry.logValues,
            );
        }
        logEntry.name = TextEditorUtils.extractPlainText(logEntry.title);
    }

    static async typeahead({ query }) {
        if (!query) {
            return LogCategory.typeahead.call(this, { query });
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

    static async validateInternal(inputEntry) {
        const results = [
            this.validateNonEmptyString('.title', inputEntry.name),
        ];
        if (isRealItem(inputEntry.logCategory)) {
            const logCategoryResults = await this.validateRecursive(
                LogCategory, '.logCategory', inputEntry.logCategory,
            );
            results.push(...logCategoryResults);
        }
        const logValuesResults = await this.validateRecursiveList(
            LogValue, '.logValues', inputEntry.logValues,
        );
        results.push(...logValuesResults);
        return results;
    }

    static async load(id) {
        const logEntry = await this.database.findByPk('LogEntry', id, this.transaction);
        // TODO: Parallelize the following operations.
        let outputLogCategory;
        if (logEntry.category_id) {
            outputLogCategory = await LogCategory.load.call(this, logEntry.category_id);
        } else {
            outputLogCategory = LogCategory.createVirtual();
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
            name: logEntry.name,
            title: logEntry.title,
            details: logEntry.details,
            logCategory: outputLogCategory, // TODO: Create empty if needed.
            logValues: outputLogValues,
        };
    }

    static async save(inputLogEntry) {
        let logCategory = null;
        if (isRealItem(inputLogEntry.logCategory)) {
            logCategory = await this.database.findByPk('LogCategory', inputLogEntry.logCategory.id);
            const logCategoryKeys = await this.database.getNodesByEdge(
                'LogCategoryToLogKey',
                'category_id',
                logCategory.id,
                'key_id',
                'LogKey',
                this.transaction,
            );
            assert(
                logCategoryKeys.map((logKey) => logKey.id).equals(
                    inputLogEntry.logValues.map((logValue) => logValue.logKey.id),
                ),
                `${'Missing keys for selected category!'
                    + '\nExpected = '}${logCategoryKeys.map((logKey) => logKey.name).join(', ')
                }\nActual = ${inputLogEntry.logValues.map((logValue) => logValue.logKey.name).join(', ')}`,
            );
        }

        LogEntry.trigger(inputLogEntry);
        const fields = {
            id: inputLogEntry.id,
            name: inputLogEntry.name,
            title: inputLogEntry.title,
            category_id: logCategory ? logCategory.id : null,
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
            ...TextEditorUtils.extractLogTags(logEntry.title),
            ...TextEditorUtils.extractLogTags(logEntry.details),
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
        const countResults = await this.database.count(
            'LogEntryToLogValue',
            {
                value_id: {
                    [this.database.Op.in]: logValueIds,
                },
            },
            ['value_id'],
            this.transaction,
        );
        await Promise.all(
            countResults
                .filter((countResult) => countResult.count === 0)
                .map((countResult) => this.database.delete(
                    'LogValue',
                    countResult.value_id,
                    this.transaction,
                )),
        );
    }
}

export default LogEntry;
