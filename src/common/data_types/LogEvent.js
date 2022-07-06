import assert from 'assert';

import RichTextUtils from '../RichTextUtils';
import DataTypeBase from './base';
import LogKey from './LogKey';
import LogStructure from './LogStructure';
import { getVirtualID } from './utils';
import { validateRecursive } from './validation';

const { LogLevel } = LogStructure;

class LogEvent extends DataTypeBase {
    static createVirtual({
        date = null,
        title = null,
        details = null,
        logLevel = LogLevel.getIndex(LogLevel.NORMAL),
        logStructure = null,
        isFavorite = false,
        isComplete = true,
    }) {
        if (typeof date !== 'string' || date.match(/\(/)) {
            // In case the filters are gt(null) or lt(null) or dateRange, default to null.
            date = null;
        }
        // Abstraction leak! The LogEventSearch component filters to logLevels = [2,3] by default.
        if (Array.isArray(logLevel)) {
            [logLevel] = logLevel;
        }
        const logEvent = {
            __type__: 'log-event',
            date,
            orderingIndex: null,
            __id__: getVirtualID(),
            title,
            details,
            logLevel,
            logStructure,
            isFavorite,
            isComplete,
        };
        LogEvent.addDefaultStructureValues(logEvent);
        LogEvent.trigger(logEvent);
        return logEvent;
    }

    static addDefaultStructureValues(logEvent) {
        if (logEvent.logStructure) {
            logEvent.logStructure.eventKeys = logEvent.logStructure.eventKeys.map((logKey) => ({
                ...logKey,
                value: logKey.value
                    || LogKey.Type[logKey.type].getDefault(logKey)
                    || null,
            }));
        }
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
        await DataTypeBase.updateWhere.call(this, where, {
            date: 'date',
            title: 'title',
            details: 'details',
            logStructure: 'structure_id',
            isFavorite: 'is_favorite',
            isComplete: 'is_complete',
            logLevel: 'log_level',
        });
    }

    static trigger(logEvent) {
        if (logEvent.logStructure) {
            const getLogKeyValue = (logKey) => logKey.value || (logKey.isOptional ? '' : logKey);
            logEvent.logStructure.eventKeys.forEach((logKey, index) => {
                if (!logKey.template) {
                    return;
                }
                const previousEventKeys = logEvent.logStructure.eventKeys.slice(0, index);
                logKey.value = RichTextUtils.extractPlainText(
                    RichTextUtils.updateDraftContent(
                        logKey.template,
                        previousEventKeys,
                        previousEventKeys.map(getLogKeyValue),
                        true, // evaluateExpressions
                    ),
                );
            });
            logEvent.title = RichTextUtils.updateDraftContent(
                logEvent.logStructure.titleTemplate,
                logEvent.logStructure.eventKeys,
                logEvent.logStructure.eventKeys.map((logKey) => logKey.value || (logKey.isOptional ? '' : logKey)),
                true, // evaluateExpressions
            );
            logEvent.logLevel = logEvent.logStructure.logLevel;
        }
    }

    static async updateLogTopicsInTitleAndDetails(inputLogEvent) {
        const originalLogTopics = Object.values({
            ...RichTextUtils.extractMentions(inputLogEvent.title, 'log-topic'),
            ...RichTextUtils.extractMentions(inputLogEvent.details, 'log-topic'),
        });
        const updatedLogTopics = await Promise.all(
            originalLogTopics.map((originalTopic) => this.invoke.call(
                this,
                'log-topic-load-partial',
                originalTopic,
            )),
        );
        inputLogEvent.title = RichTextUtils.updateDraftContent(
            inputLogEvent.title,
            originalLogTopics,
            updatedLogTopics,
        );
        inputLogEvent.details = RichTextUtils.updateDraftContent(
            inputLogEvent.details,
            originalLogTopics,
            updatedLogTopics,
        );
        return updatedLogTopics.map((logTopic) => logTopic.__id__);
    }

    static async updateLogTopics(inputLogEvent) {
        const promises = [];
        promises.push(LogEvent.updateLogTopicsInTitleAndDetails.call(this, inputLogEvent));
        if (inputLogEvent.logStructure) {
            inputLogEvent.logStructure.eventKeys.forEach((inputLogKey) => {
                promises.push(LogKey.updateLogTopics.call(this, inputLogKey));
            });
        }
        const listOfTopicIDs = await Promise.all(promises);
        return listOfTopicIDs.flat();
    }

    static async validate(inputLogEvent) {
        const results = [];

        results.push([
            '.title',
            !!inputLogEvent.title,
            'must be non-empty.',
        ]);

        if (inputLogEvent.logStructure) {
            const logStructureResults = await validateRecursive.call(
                this,
                LogStructure,
                '.logStructure',
                inputLogEvent.logStructure,
            );
            results.push(...logStructureResults);

            results.push([
                '.logStructure.allowEventDetails',
                inputLogEvent.logStructure.allowEventDetails
                    ? true
                    : inputLogEvent.details === null,
                'does not allow .details',
            ]);

            const logKeyResults = await Promise.all(
                inputLogEvent.logStructure.eventKeys.map(
                    async (inputLogKey, index) => LogKey.validateValue.call(
                        this,
                        inputLogKey,
                        index,
                    ),
                ),
            );
            results.push(...logKeyResults.filter((result) => result));
        }

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
            outputLogStructure.eventKeys.forEach((logKey, index) => {
                logKey.value = structureValues[index] || null;
            });
        } else {
            assert(logEvent.structure_values === null);
        }
        return {
            __type__: 'log-event',
            __id__: logEvent.id,
            date: logEvent.date,
            isComplete: logEvent.is_complete,
            orderingIndex: logEvent.ordering_index,
            title: RichTextUtils.deserialize(
                logEvent.title,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            details: RichTextUtils.deserialize(
                logEvent.details,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            logLevel: logEvent.log_level,
            isFavorite: logEvent.is_favorite,
            logStructure: outputLogStructure,
        };
    }

    static async save(inputLogEvent) {
        let logEvent = await this.database.findItem('LogEvent', inputLogEvent);

        DataTypeBase.broadcast.call(this, 'log-event-list', logEvent, { date: inputLogEvent.date });

        // Before the serialization process, since the input is modified.
        const targetLogTopicIDs = await LogEvent.updateLogTopics.call(this, inputLogEvent);

        const shouldResetOrderingIndex = logEvent ? (
            logEvent.date !== inputLogEvent.date
            || logEvent.is_complete !== inputLogEvent.isComplete
        ) : true;
        const orderingIndexWhere = {
            date: inputLogEvent.date,
            is_complete: inputLogEvent.isComplete,
        };
        const orderingIndex = await DataTypeBase.getOrderingIndex
            .call(this, shouldResetOrderingIndex ? null : logEvent, orderingIndexWhere);
        let logValues;
        if (inputLogEvent.logStructure) {
            logValues = inputLogEvent.logStructure.eventKeys.map(
                (eventKey) => eventKey.value || null,
            );
        }
        const updated = {
            date: inputLogEvent.date,
            ordering_index: orderingIndex,
            title: RichTextUtils.serialize(
                inputLogEvent.title,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            details: RichTextUtils.serialize(
                inputLogEvent.details,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            log_level: inputLogEvent.logLevel,
            is_favorite: inputLogEvent.isFavorite,
            is_complete: inputLogEvent.isComplete,
            structure_id: inputLogEvent.logStructure ? inputLogEvent.logStructure.__id__ : null,
            structure_values: logValues ? JSON.stringify(logValues) : null,
        };
        logEvent = await this.database.createOrUpdateItem('LogEvent', logEvent, updated);

        await this.database.setEdges(
            'LogEventToLogTopic',
            'source_event_id',
            logEvent.id,
            'target_topic_id',
            Object.values(targetLogTopicIDs).reduce((result, topicID) => {
                // eslint-disable-next-line no-param-reassign
                result[topicID] = {};
                return result;
            }, {}),
        );
        await this.invoke.call(
            this,
            'structure-value-typeahead-index-$refresh',
            { structure_id: logEvent.structure_id },
        );

        this.broadcast('reminder-sidebar');
        return logEvent.id;
    }

    static async delete(id) {
        const logEvent = await this.database.deleteByPk('LogEvent', id);
        DataTypeBase.broadcast.call(this, 'log-event-list', logEvent, ['date']);
        await this.invoke.call(
            this,
            'structure-value-typeahead-index-$refresh',
            { structure_id: logEvent.structure_id },
        );
        return { __id__: logEvent.id };
    }
}

LogEvent.LogLevel = LogLevel;

export default LogEvent;
