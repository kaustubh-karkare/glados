import assert from 'assert';
import Base from './Base';
import LogStructure from './LogStructure';
import TextEditorUtils from '../common/TextEditorUtils';
import { getVirtualID } from './Utils';


const { LogLevel } = LogStructure;


class LogEvent extends Base {
    static createVirtual({
        date, title, logLevel, logStructure,
    } = {}) {
        if (logStructure) {
            logStructure.logKeys.forEach((logKey) => {
                logKey.value = LogStructure.Key[logKey.type].default || null;
            });
        }
        const logEvent = {
            __type__: 'log-event',
            date: date || null,
            orderingIndex: null,
            id: getVirtualID(),
            name: '',
            title: title || '',
            details: '',
            logLevel: logLevel || LogLevel.getIndex(LogLevel.NORMAL),
            onSidebar: false,
            isComplete: true,
            logStructure: logStructure || null,
        };
        LogEvent.trigger(logEvent);
        return logEvent;
    }

    static trigger(logEvent) {
        if (logEvent.logStructure) {
            let content = TextEditorUtils.deserialize(
                logEvent.logStructure.titleTemplate,
                TextEditorUtils.StorageType.DRAFTJS,
            );
            content = TextEditorUtils.updateDraftContent(
                content,
                logEvent.logStructure.logKeys,
                logEvent.logStructure.logKeys.map((logKey) => logKey.value || logKey),
            );
            content = TextEditorUtils.evaluateDraftContentExpressions(content);
            logEvent.title = TextEditorUtils.serialize(
                content,
                TextEditorUtils.StorageType.DRAFTJS,
            );
            logEvent.logLevel = logEvent.logStructure.logLevel;
        }
        logEvent.name = TextEditorUtils.extractPlainText(logEvent.title);
    }

    static async validateInternal(inputLogEvent) {
        const results = [];
        if (inputLogEvent.date !== null) {
            results.push(Base.validateDateLabel('.date', inputLogEvent.date));
        }
        results.push(Base.validateNonEmptyString('.title', inputLogEvent.name));
        if (inputLogEvent.logStructure) {
            const logStructureResults = await Base.validateRecursive(
                LogStructure, '.logStructure', inputLogEvent.logStructure,
            );
            results.push(...logStructureResults);

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
        return {
            __type__: 'log-event',
            id: logEvent.id,
            date: logEvent.date,
            orderingIndex: logEvent.ordering_index,
            name: logEvent.name,
            title: logEvent.title,
            details: logEvent.details,
            logLevel: logEvent.log_level,
            onSidebar: logEvent.on_sidebar,
            isComplete: logEvent.is_complete,
            logStructure: outputLogStructure,
        };
    }

    static async save(inputLogEvent) {
        let logEvent = await this.database.findItem('LogEvent', inputLogEvent);

        Base.broadcast.call(this, 'log-event-list', logEvent, { date: inputLogEvent.date });

        if (inputLogEvent.date === null) {
            assert(!inputLogEvent.isComplete);
        }
        const orderingIndex = await Base.getOrderingIndex
            .call(this, logEvent, { date: inputLogEvent.date });
        let logValues;
        if (inputLogEvent.logStructure) {
            logValues = inputLogEvent.logStructure.logKeys.map((logKey) => logKey.value);
        }
        const fields = {
            date: inputLogEvent.date,
            ordering_index: orderingIndex,
            name: inputLogEvent.name,
            title: inputLogEvent.title,
            details: inputLogEvent.details,
            log_level: inputLogEvent.logLevel,
            on_sidebar: inputLogEvent.onSidebar,
            is_complete: inputLogEvent.isComplete,
            structure_id: inputLogEvent.logStructure ? inputLogEvent.logStructure.id : null,
            structure_values: logValues ? JSON.stringify(logValues) : null,
        };
        logEvent = await this.database.createOrUpdateItem('LogEvent', logEvent, fields);

        const updatedTitle = TextEditorUtils.deserialize(
            logEvent.title,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        const updatedDetails = TextEditorUtils.deserialize(
            logEvent.details,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        const targetLogTopics = {
            ...TextEditorUtils.extractMentions(updatedTitle, 'log-topic'),
            ...TextEditorUtils.extractMentions(updatedDetails, 'log-topic'),
        };
        if (logValues) {
            logValues.forEach((value) => {
                if (typeof value === 'object' && value && value.__type__ === 'log-topic') {
                    targetLogTopics[value.id] = value;
                }
            });
        }
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

        this.broadcast('reminder-sidebar');
        return logEvent.id;
    }

    static async delete(id) {
        const logEvent = await this.database.deleteByPk('LogEvent', id);
        Base.broadcast.call(this, 'log-event-list', logEvent, ['date']);
        return { id: logEvent.id };
    }
}

LogEvent.LogLevel = LogLevel;

export default LogEvent;
