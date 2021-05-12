import { getVirtualID, getPartialItem } from './Utils';
import Base from './Base';
import Enum from '../common/Enum';
import Frequency from './Frequency';
import TextEditorUtils from '../common/TextEditorUtils';
import LogStructureGroup from './LogStructureGroup';


const LogStructureKey = Enum([
    {
        value: 'string',
        label: 'String',
        validator: async () => true,
    },
    {
        value: 'integer',
        label: 'Integer',
        validator: async (value) => !!value.match(/^\d+$/),
    },
    {
        value: 'number',
        label: 'Number',
        validator: async (value) => !!value.match(/^\d+(?:\.\d+)?$/),
    },
    {
        value: 'time',
        label: 'Time',
        validator: async (value) => !!value.match(/^\d{2}:\d{2}$/),
    },
    {
        value: 'yes_or_no',
        label: 'Yes / No',
        validator: async (value) => !!value.match(/^(?:yes|no)$/),
        default: 'no',
    },
    {
        value: 'log_topic',
        label: 'Topic',
        validator: async (value, logKey, that) => {
            const logTopic = await that.invoke.call(that, 'log-topic-load', value);
            return logTopic.parentLogTopic.id === logKey.parentLogTopic.id;
        },
    },
    {
        value: 'rich_text_line',
        label: 'Rich Text Line',
        validator: async (value) => true,
    },
]);

const LogLevel = Enum([
    {
        value: 'minor',
        label: 'Minor (1)',
        index: 1,
    },
    {
        value: 'normal',
        label: 'Normal (2)',
        index: 2,
    },
    {
        value: 'major',
        label: 'Major (3)',
        index: 3,
    },
]);

LogLevel.getIndex = (value) => LogLevel[value].index;
LogLevel.getValue = (index) => LogLevel.Options[index - 1].value;


class LogStructure extends Base {
    static createVirtual({ logStructureGroup, name = '' }) {
        return {
            __type__: 'log-structure',
            id: getVirtualID(),
            logStructureGroup,
            name,
            details: null,
            logKeys: [],
            titleTemplate: '',
            needsEdit: false,
            isPeriodic: false,
            reminderText: null,
            frequency: null,
            frequencyArgs: null,
            warningDays: null,
            suppressUntilDate: null,
            logLevel: LogLevel.getIndex(LogLevel.NORMAL),
        };
    }

    static async updateWhere(where) {
        await Base.updateWhere.call(this, where, {
            id: 'id',
            logStructureGroup: 'group_id',
            isPeriodic: 'is_periodic',
            logMode: 'mode_id',
        });
    }

    static trigger(logStructure) {
        // TODO: If a key is deleted, remove it from the content.
        const options = [getPartialItem(logStructure), ...logStructure.logKeys];
        if (logStructure.name && !logStructure.titleTemplate) {
            logStructure.titleTemplate = TextEditorUtils.convertPlainTextToDraftContent('$0', {
                $: [logStructure],
            });
        }
        logStructure.titleTemplate = TextEditorUtils.updateDraftContent(
            logStructure.titleTemplate,
            options,
            options,
        );
        if (logStructure.logKeys.length) {
            logStructure.needsEdit = true;
        }
    }

    static extractLogTopics(inputLogStructure) {
        const logTopics = {
            ...TextEditorUtils.extractMentions(inputLogStructure.titleTemplate, 'log-topic'),
            ...TextEditorUtils.extractMentions(inputLogStructure.details, 'log-topic'),
        };
        inputLogStructure.logKeys.forEach((logKey) => {
            if (logKey.type === LogStructure.Key.LOG_TOPIC && logKey.parentLogTopic) {
                logTopics[logKey.parentLogTopic.id] = logKey.parentLogTopic;
            }
        });
        return logTopics;
    }

    static async validateInternal(inputLogStructure) {
        const results = [];

        const logStructureGroupResults = await Base.validateRecursive.call(
            this, LogStructureGroup, '.logStructureGroup', inputLogStructure.logStructureGroup,
        );
        results.push(...logStructureGroupResults);

        inputLogStructure.logKeys.forEach((logKey, index) => {
            const prefix = `.logKey[${index}]`;
            results.push(Base.validateNonEmptyString(`${prefix}.name`, logKey.name));
            results.push(Base.validateNonEmptyString(`${prefix}.type`, logKey.type));
            if (logKey.type === LogStructureKey.LOG_TOPIC) {
                results.push([
                    `${prefix}.parentLogTopic`,
                    logKey.parentLogTopic,
                    'must be provided!',
                ]);
            }
        });

        results.push([
            '.titleTemplate',
            inputLogStructure.id in TextEditorUtils.extractMentions(
                inputLogStructure.titleTemplate,
                'log-structure',
            ),
            'must mention the structure!',
        ]);

        if (inputLogStructure.isPeriodic) {
            results.push([
                '.isPeriodic',
                inputLogStructure.frequency !== null
                && inputLogStructure.suppressUntilDate !== null,
                'requires frequency & suppressUntilDate is set.',
            ]);
        } else {
            results.push([
                '.isPeriodic',
                inputLogStructure.frequency === null
                && inputLogStructure.suppressUntilDate === null,
                'requires frequency & suppressUntilDate to be unset.',
            ]);
        }

        const targetLogTopics = LogStructure.extractLogTopics(inputLogStructure);
        const modeValidationResults = await this.invoke.call(
            this,
            'validate-log-topic-modes',
            { logMode: inputLogStructure.logStructureGroup.logMode, targetLogTopics },
        );
        results.push(...modeValidationResults);

        return results;
    }

    static async load(id) {
        const logStructure = await this.database.findByPk('LogStructure', id);
        const outputLogStructureGroup = await this.invoke.call(
            this,
            'log-structure-group-load',
            { id: logStructure.group_id },
        );
        const logKeys = await Promise.all(
            JSON.parse(logStructure.keys).map(
                (logKey) => LogStructure.loadKey.call(this, logKey),
            ),
        );
        return {
            __type__: 'log-structure',
            id: logStructure.id,
            logStructureGroup: outputLogStructureGroup,
            name: logStructure.name,
            details: TextEditorUtils.deserialize(
                logStructure.details,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            logKeys,
            titleTemplate: TextEditorUtils.deserialize(
                logStructure.title_template,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            needsEdit: logStructure.needs_edit,
            isPeriodic: logStructure.is_periodic,
            reminderText: logStructure.reminder_text,
            frequency: logStructure.frequency,
            frequencyArgs: logStructure.frequency_args,
            warningDays: logStructure.warning_days,
            suppressUntilDate: logStructure.suppress_until_date,
            logLevel: logStructure.log_level,
        };
    }

    static async save(inputLogStructure) {
        const logStructure = await this.database.findItem('LogStructure', inputLogStructure);
        const originalLogStructure = logStructure ? { ...logStructure.dataValues } : null;

        Base.broadcast.call(
            this,
            'log-structure-list',
            logStructure,
            { group_id: inputLogStructure.logStructureGroup.id },
        );

        const orderingIndex = await Base.getOrderingIndex.call(this, logStructure);
        const fields = {
            mode_id: inputLogStructure.logStructureGroup.logMode.id,
            group_id: inputLogStructure.logStructureGroup.id,
            ordering_index: orderingIndex,
            name: inputLogStructure.name,
            details: TextEditorUtils.serialize(
                inputLogStructure.details,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            keys: JSON.stringify(inputLogStructure.logKeys.map(
                (logKey) => LogStructure.saveKey.call(this, logKey),
            )),
            title_template: TextEditorUtils.serialize(
                inputLogStructure.titleTemplate,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            needs_edit: inputLogStructure.needsEdit,
            is_periodic: inputLogStructure.isPeriodic,
            reminder_text: inputLogStructure.reminderText,
            frequency: inputLogStructure.frequency,
            frequency_args: inputLogStructure.frequencyArgs,
            warning_days: inputLogStructure.warningDays,
            suppress_until_date: inputLogStructure.suppressUntilDate,
            log_level: inputLogStructure.logLevel,
        };
        const updatedLogStructure = await this.database.createOrUpdateItem(
            'LogStructure', logStructure, fields,
        );

        const targetLogTopics = LogStructure.extractLogTopics(inputLogStructure);
        await this.database.setEdges(
            'LogStructureToLogTopic',
            'source_structure_id',
            updatedLogStructure.id,
            'target_topic_id',
            Object.values(targetLogTopics).reduce((result, targetLogTopic) => {
                // eslint-disable-next-line no-param-reassign
                result[targetLogTopic.id] = {};
                return result;
            }, {}),
        );

        if (originalLogStructure) {
            let shouldRegenerateLogEvents = (
                originalLogStructure.name !== updatedLogStructure.name
                || originalLogStructure.keys !== updatedLogStructure.keys
            );
            if (!shouldRegenerateLogEvents) {
                const originalTitleTemplate = TextEditorUtils.deserialize(
                    originalLogStructure.title_template,
                    TextEditorUtils.StorageType.DRAFTJS,
                );
                shouldRegenerateLogEvents = !TextEditorUtils.equals(
                    originalTitleTemplate,
                    inputLogStructure.titleTemplate,
                );
            }
            if (!shouldRegenerateLogEvents) {
                shouldRegenerateLogEvents = (
                    originalLogStructure.log_level !== updatedLogStructure.log_level
                    || originalLogStructure.mode_id !== updatedLogStructure.mode_id
                );
            }
            if (shouldRegenerateLogEvents) {
                await LogStructure.updateLogEvents.call(this, inputLogStructure);
            }
        } else {
            const updatedTitleTemplate = TextEditorUtils.updateDraftContent(
                inputLogStructure.titleTemplate,
                [inputLogStructure],
                [{ ...getPartialItem(inputLogStructure), id: updatedLogStructure.id }],
            );
            const transaction = this.database.getTransaction();
            const fields2 = {
                title_template: TextEditorUtils.serialize(
                    updatedTitleTemplate,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
            };
            await updatedLogStructure.update(fields2, { transaction });
        }
        await this.invoke.call(
            this,
            'value-typeahead-index-refresh',
            { structure_id: updatedLogStructure.id },
        );

        this.broadcast('reminder-sidebar');
        return updatedLogStructure.id;
    }

    static async updateLogEvents(inputLogStructure) {
        const inputLogEvents = await this.invoke.call(
            this,
            'log-event-list',
            { where: { logStructure: inputLogStructure } },
        );
        await Promise.all(inputLogEvents.map(async (inputLogEvent) => {
            // TODO: Update inputLogEvent based on inputLogStructure.
            // eslint-disable-next-line no-unused-expressions
            inputLogStructure;
            return this.invoke.call(this, 'log-event-upsert', inputLogEvent);
        }));
    }

    static async delete(id) {
        const logStructure = await this.database.deleteByPk('LogStructure', id);
        Base.broadcast.call(this, 'log-structure-list', logStructure, ['group_id']);
        await this.invoke.call(
            this,
            'value-typeahead-index-refresh',
            { structure_id: logStructure.id },
        );
        return { id: logStructure.id };
    }

    // Log Structure Keys

    static createNewKey({ index }) {
        return {
            __type__: 'log-structure-key',
            id: index,
            name: '',
            type: LogStructureKey.STRING,
            isOptional: false,
            parentLogTopic: null,
        };
    }

    static async loadKey(rawLogKey) {
        let parentLogTopic = null;
        if (rawLogKey.parent_topic_id) {
            parentLogTopic = await this.invoke.call(this, 'log-topic-load', {
                id: rawLogKey.parent_topic_id,
            });
        }
        return {
            __type__: 'log-structure-key',
            id: rawLogKey.id,
            name: rawLogKey.name,
            type: rawLogKey.type,
            isOptional: rawLogKey.is_optional,
            parentLogTopic,
        };
    }

    static saveKey(inputLogKey) {
        return {
            id: inputLogKey.id,
            name: inputLogKey.name,
            type: inputLogKey.type,
            is_optional: inputLogKey.isOptional,
            parent_topic_id: inputLogKey.parentLogTopic ? inputLogKey.parentLogTopic.id : null,
        };
    }
}

LogStructure.Key = LogStructureKey;
LogStructure.Frequency = Frequency;
LogStructure.LogLevel = LogLevel;

export default LogStructure;
