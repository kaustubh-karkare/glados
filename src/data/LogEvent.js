import assert from '../common/assert';
import Base from './Base';
import LogStructure from './LogStructure';
import { extractLogTopics, substituteValuesIntoDraftContent } from '../common/DraftContentUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import { getVirtualID } from './Utils';


class LogEvent extends Base {
    static createVirtual({
        date, title, isMajor, logStructure,
    } = {}) {
        if (logStructure) {
            logStructure.logKeys.forEach((logKey) => {
                logKey.value = '';
            });
        }
        return {
            __type__: 'log-event',
            date: date || null,
            orderingIndex: null,
            id: getVirtualID(),
            name: '',
            title: title || '',
            details: '',
            isMajor: isMajor || true,
            logStructure: logStructure || null,
        };
    }

    static trigger(logEvent) {
        if (logEvent.logStructure) {
            if (logEvent.logStructure.titleTemplate) {
                const content = TextEditorUtils.deserialize(
                    logEvent.logStructure.titleTemplate,
                    TextEditorUtils.StorageType.DRAFTJS,
                );
                const plaintext = substituteValuesIntoDraftContent(
                    content,
                    logEvent.logStructure.logKeys,
                );
                logEvent.title = TextEditorUtils.serialize(
                    plaintext,
                    TextEditorUtils.StorageType.PLAINTEXT,
                );
            } else {
                logEvent.title = TextEditorUtils.serialize(
                    logEvent.logStructure.name,
                    TextEditorUtils.StorageType.PLAINTEXT,
                );
            }
        }
        logEvent.name = TextEditorUtils.extractPlainText(logEvent.title);
    }

    static async list(input) {
        if (input && input.selector && input.selector.topic_id) {
            const edges = await this.database.getEdges(
                'LogEventToLogTopic',
                'topic_id',
                input.selector.topic_id,
                this.transaction,
            );
            delete input.selector.topic_id;
            input.selector.id = {
                [this.database.Op.in]: edges.map((edge) => edge.event_id),
            };
        }
        return Base.list.call(this, input);
    }

    static async validateInternal(inputLogEvent) {
        const results = [];
        if (inputLogEvent.date !== null) {
            results.push(this.validateDateLabel('.date', inputLogEvent.date));
        }
        results.push(this.validateNonEmptyString('.title', inputLogEvent.name));
        if (inputLogEvent.logStructure) {
            const logStructureResults = await this.validateRecursive(
                LogStructure, '.logStructure', inputLogEvent.logStructure,
            );
            results.push(...logStructureResults);

            inputLogEvent.logStructure.logKeys.forEach((logKey, index) => {
                // const logKey = inputLogEvent.logStructure.logKeys[index];
                const prefix = `.logKeys[${index}].value`;
                // TODO: Validate data using logKey
                results.push(
                    this.validateUsingLambda(
                        prefix,
                        logKey.value,
                        LogStructure.KeyOptionsMap[logKey.type].validator,
                    ),
                );
            });
        }
        return results;
    }

    static async load(id) {
        const logEvent = await this.database.findByPk('LogEvent', id, this.transaction);
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
            logStructure: outputLogStructure,
        };
    }

    static async save(inputLogEvent) {
        let logEvent = await this.database.findItem(
            'LogEvent',
            inputLogEvent,
            this.transaction,
        );

        if (logEvent && logEvent.date && logEvent.date !== inputLogEvent.date) {
            this.broadcast('log-event-list', {
                selector: { date: logEvent.date },
            });
        }
        if (inputLogEvent.date && (logEvent ? inputLogEvent.date !== logEvent.date : true)) {
            this.broadcast('log-event-list', {
                selector: { date: inputLogEvent.date },
            });
        }

        // TODO(broadcast): Make this more specific!
        this.broadcast('log-event-list'); // Update all lists!

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
            structure_id: inputLogEvent.logStructure ? inputLogEvent.logStructure.id : null,
            structure_values: logValues ? JSON.stringify(logValues) : null,
        };
        logEvent = await this.database.createOrUpdateItem(
            'LogEvent', logEvent, fields, this.transaction,
        );

        const logTopics = {
            ...extractLogTopics(
                TextEditorUtils.deserialize(
                    logEvent.title,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
            ),
            ...extractLogTopics(
                TextEditorUtils.deserialize(
                    logEvent.details,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
            ),
        };
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
            this.transaction,
        );

        return logEvent.id;
    }
}

export default LogEvent;
