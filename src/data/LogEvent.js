import assert from 'assert';
import Base from './Base';
import LogMode from './LogMode';
import LogStructure from './LogStructure';
import TextEditorUtils from '../common/TextEditorUtils';
import { getVirtualID } from './Utils';


const { LogLevel } = LogStructure;


class LogEvent extends Base {
    static createVirtual({
        date = null,
        title = null,
        details = null,
        logMode = null,
        logLevel = LogLevel.getIndex(LogLevel.NORMAL),
        logStructure = null,
        isFavorite = false,
        isComplete = true,
    }) {
        if (logStructure) {
            logStructure.logKeys = logStructure.logKeys.map((logKey) => ({
                ...logKey,
                value: logKey.value
                    || LogStructure.Key[logKey.type].getDefault(logKey)
                    || null,
            }));
        }
        // Abstraction leak! The LogEventSearch component filters to logLevels = [2,3] by default.
        if (Array.isArray(logLevel)) {
            [logLevel] = logLevel;
        }
        const logEvent = {
            __type__: 'log-event',
            logMode,
            date,
            orderingIndex: null,
            id: getVirtualID(),
            title,
            details,
            logLevel,
            logStructure,
            isFavorite,
            isComplete,
        };
        LogEvent.trigger(logEvent);
        return logEvent;
    }

    static async updateWhere(where) {
        if (where.date && typeof where.date === 'object') {
            where.date = {
                [this.database.Op.gte]: where.date.startDate,
                [this.database.Op.lte]: where.date.endDate,
            };
        } else if (typeof where.date === 'string') {
            const reResult = where.date.match(/^(\w+)\(([\w-]+)\)$/);
            if (reResult) {
                const operator = this.database.Op[reResult[1]];
                const value = reResult[1] === 'null' ? null : reResult[2];
                where.date = { [operator]: value };
            }
        }
        if (where.title) {
            where.title = {
                [this.database.Op.like]: `%${where.title}%`,
            };
        }
        if (where.details) {
            where.details = {
                [this.database.Op.like]: `%${where.details}%`,
            };
        }
        await Base.updateWhere.call(this, where, {
            date: 'date',
            title: 'title',
            details: 'details',
            logStructure: 'structure_id',
            isFavorite: 'is_favorite',
            isComplete: 'is_complete',
            logLevel: 'log_level',
            logMode: 'mode_id',
        });
    }

    static trigger(logEvent) {
        if (logEvent.logStructure) {
            logEvent.logMode = logEvent.logStructure.logStructureGroup.logMode;
            const getLogKeyValue = (logKey) => logKey.value || (logKey.isOptional ? '' : logKey);
            logEvent.logStructure.logKeys.forEach((logKey, index) => {
                if (!logKey.template) {
                    return;
                }
                const previousLogKeys = logEvent.logStructure.logKeys.slice(0, index);
                logKey.value = TextEditorUtils.extractPlainText(
                    TextEditorUtils.updateDraftContent(
                        logKey.template,
                        previousLogKeys,
                        previousLogKeys.map(getLogKeyValue),
                        true, // evaluateExpressions
                    ),
                );
            });
            logEvent.title = TextEditorUtils.updateDraftContent(
                logEvent.logStructure.titleTemplate,
                logEvent.logStructure.logKeys,
                logEvent.logStructure.logKeys.map((logKey) => logKey.value || (logKey.isOptional ? '' : logKey)),
                true, // evaluateExpressions
            );
            logEvent.logLevel = logEvent.logStructure.logLevel;
        }
    }

    static extractLogTopics(inputLogEvent) {
        let logTopics = {
            ...TextEditorUtils.extractMentions(inputLogEvent.title, 'log-topic'),
            ...TextEditorUtils.extractMentions(inputLogEvent.details, 'log-topic'),
        };
        if (inputLogEvent.logStructure) {
            inputLogEvent.logStructure.logKeys.forEach((logKey) => {
                if (logKey.type === LogStructure.Key.LOG_TOPIC && logKey.value) {
                    logTopics[logKey.value.id] = logKey.value;
                } else if (logKey.type === LogStructure.Key.RICH_TEXT_LINE) {
                    logTopics = {
                        ...logTopics,
                        ...TextEditorUtils.extractMentions(logKey.value, 'log-topic'),
                    };
                }
            });
        }
        return logTopics;
    }

    static async validateInternal(inputLogEvent) {
        const results = [];

        if (inputLogEvent.logMode) {
            const logModeResults = await Base.validateRecursive.call(
                this, LogMode, '.logMode', inputLogEvent.logMode,
            );
            results.push(...logModeResults);
        } else {
            results.push(['.logMode', false, 'is missing.']);
        }

        results.push([
            '.title',
            !!inputLogEvent.title,
            'must be non-empty.',
        ]);

        if (inputLogEvent.logStructure) {
            const logStructureResults = await Base.validateRecursive.call(
                this, LogStructure, '.logStructure', inputLogEvent.logStructure,
            );
            results.push(...logStructureResults);

            results.push([
                '.logStructure.logMode',
                inputLogEvent.logStructure.logStructureGroup.logMode.id
                === inputLogEvent.logMode.id,
                'should match .logMode',
            ]);

            results.push([
                '.logStructure.allowEventDetails',
                inputLogEvent.logStructure.allowEventDetails
                    ? true
                    : inputLogEvent.details === null,
                'does not allow .details',
            ]);

            const logKeyResults = await Promise.all(
                inputLogEvent.logStructure.logKeys.map(async (logKey, index) => {
                    if (logKey.isOptional && !logKey.value) return null;
                    const name = `.logKeys[${index}].value`;
                    if (!logKey.value) return [name, false, 'must be non-empty.'];
                    const KeyOption = LogStructure.Key[logKey.type];
                    let isValid = await KeyOption.validator(logKey.value, logKey, this);
                    if (!isValid && KeyOption.maybeFix) {
                        const fixedValue = KeyOption.maybeFix(logKey.value, logKey);
                        if (fixedValue) {
                            logKey.value = fixedValue;
                            isValid = true;
                        }
                    }
                    return [name, isValid, 'fails validation for specified type.'];
                }),
            );
            results.push(...logKeyResults.filter((result) => result));
        }

        const targetLogTopics = LogEvent.extractLogTopics(inputLogEvent);
        const modeValidationResults = await this.invoke.call(
            this,
            'validate-log-topic-modes',
            { logMode: inputLogEvent.logMode, targetLogTopics },
        );
        results.push(...modeValidationResults);

        if (inputLogEvent.isComplete) {
            results.push([
                '.date',
                inputLogEvent.date !== null,
                'should not be null.',
            ]);
        }
        return results;
    }

    static async load(id) {
        const logEvent = await this.database.findByPk('LogEvent', id);
        let outputLogStructure = null;
        if (logEvent.structure_id) {
            outputLogStructure = await LogStructure.load.call(this, logEvent.structure_id);
            const structureValues = JSON.parse(logEvent.structure_values);
            outputLogStructure.logKeys.forEach((logKey, index) => {
                logKey.value = structureValues[index] || null;
            });
        } else {
            assert(logEvent.structure_values === null);
        }
        const outputLogMode = await this.invoke.call(this, 'log-mode-load', { id: logEvent.mode_id });
        return {
            __type__: 'log-event',
            id: logEvent.id,
            logMode: outputLogMode,
            date: logEvent.date,
            isComplete: logEvent.is_complete,
            orderingIndex: logEvent.ordering_index,
            title: TextEditorUtils.deserialize(
                logEvent.title,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            details: TextEditorUtils.deserialize(
                logEvent.details,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            logLevel: logEvent.log_level,
            isFavorite: logEvent.is_favorite,
            logStructure: outputLogStructure,
        };
    }

    static async save(inputLogEvent) {
        let logEvent = await this.database.findItem('LogEvent', inputLogEvent);

        Base.broadcast.call(this, 'log-event-list', logEvent, { date: inputLogEvent.date });

        const shouldResetOrderingIndex = logEvent ? (
            logEvent.date !== inputLogEvent.date
            || logEvent.is_complete !== inputLogEvent.isComplete
        ) : true;
        const orderingIndexWhere = {
            date: inputLogEvent.date,
            is_complete: inputLogEvent.isComplete,
        };
        const orderingIndex = await Base.getOrderingIndex
            .call(this, shouldResetOrderingIndex ? null : logEvent, orderingIndexWhere);
        let logValues;
        if (inputLogEvent.logStructure) {
            logValues = inputLogEvent.logStructure.logKeys.map((logKey) => logKey.value || null);
        }
        const fields = {
            mode_id: inputLogEvent.logMode.id,
            date: inputLogEvent.date,
            ordering_index: orderingIndex,
            title: TextEditorUtils.serialize(
                inputLogEvent.title,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            details: TextEditorUtils.serialize(
                inputLogEvent.details,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            log_level: inputLogEvent.logLevel,
            is_favorite: inputLogEvent.isFavorite,
            is_complete: inputLogEvent.isComplete,
            structure_id: inputLogEvent.logStructure ? inputLogEvent.logStructure.id : null,
            structure_values: logValues ? JSON.stringify(logValues) : null,
        };
        logEvent = await this.database.createOrUpdateItem('LogEvent', logEvent, fields);

        const targetLogTopics = LogEvent.extractLogTopics(inputLogEvent);
        await this.database.setEdges(
            'LogEventToLogTopic',
            'source_event_id',
            logEvent.id,
            'target_topic_id',
            Object.values(targetLogTopics).reduce((result, targetLogTopic) => {
                // eslint-disable-next-line no-param-reassign
                result[targetLogTopic.id] = {};
                return result;
            }, {}),
        );
        await this.invoke.call(
            this,
            'value-typeahead-index-refresh',
            { structure_id: logEvent.structure_id },
        );

        this.broadcast('reminder-sidebar');
        return logEvent.id;
    }

    static async delete(id) {
        const logEvent = await this.database.deleteByPk('LogEvent', id);
        Base.broadcast.call(this, 'log-event-list', logEvent, ['date']);
        await this.invoke.call(
            this,
            'value-typeahead-index-refresh',
            { structure_id: logEvent.structure_id },
        );
        return { id: logEvent.id };
    }
}

LogEvent.LogLevel = LogLevel;

export default LogEvent;
