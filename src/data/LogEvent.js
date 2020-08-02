import assert from 'assert';
import Base from './Base';
import LogStructure from './LogStructure';
import TextEditorUtils from '../common/TextEditorUtils';
import { getVirtualID } from './Utils';


class LogEvent extends Base {
    static createVirtual({
        date, title, isMajor, logStructure,
    } = {}) {
        if (logStructure) {
            logStructure.logKeys.forEach((logKey) => {
                logKey.value = LogStructure.Key[logKey.type].default || '';
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
            isMajor: typeof isMajor !== 'undefined' ? isMajor : true,
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
                logEvent.logStructure.logKeys.map((logKey) => logKey.value || logKey.name),
            );
            content = TextEditorUtils.evaluateDraftContentExpressions(content);
            logEvent.title = TextEditorUtils.serialize(
                content,
                TextEditorUtils.StorageType.DRAFTJS,
            );
            logEvent.isMajor = logEvent.logStructure.isMajor;
        }
        logEvent.name = TextEditorUtils.extractPlainText(logEvent.title);
    }

    static async updateWhere(input) {
        if (input && input.where && input.where.topic_id) {
            const edges = await this.database.getEdges(
                'LogEventToLogTopic',
                'topic_id',
                input.where.topic_id,
            );
            delete input.where.topic_id;
            input.where.id = {
                [this.database.Op.in]: edges.map((edge) => edge.event_id),
            };
        }
        return input;
    }

    static async list(input) {
        input = await LogEvent.updateWhere.call(this, input);
        return Base.list.call(this, input);
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
            JSON.parse(logEvent.structure_values).forEach((value, index) => {
                outputLogStructure.logKeys[index].value = value;
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
            isMajor: logEvent.is_major,
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
            is_major: inputLogEvent.isMajor,
            is_complete: inputLogEvent.isComplete,
            structure_id: inputLogEvent.logStructure ? inputLogEvent.logStructure.id : null,
            structure_values: logValues ? JSON.stringify(logValues) : null,
        };
        logEvent = await this.database.createOrUpdateItem('LogEvent', logEvent, fields);

        const logTopics = {
            ...TextEditorUtils.extractLogTopics(
                TextEditorUtils.deserialize(
                    logEvent.title,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
            ),
            ...TextEditorUtils.extractLogTopics(
                TextEditorUtils.deserialize(
                    logEvent.details,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
            ),
        };
        if (logValues) {
            logValues.forEach((value) => {
                if (typeof value === 'object' && value && value.__type__ === 'log-topic') {
                    logTopics[value.id] = value;
                }
            });
        }
        await this.database.setEdges(
            'LogEventToLogTopic',
            'event_id',
            logEvent.id,
            'topic_id',
            Object.values(logTopics).reduce((result, logTopic) => {
                // eslint-disable-next-line no-param-reassign
                result[logTopic.id] = {};
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

export default LogEvent;
