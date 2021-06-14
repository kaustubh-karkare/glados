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
        default: '',
    },
    {
        value: 'string_list',
        label: 'String List',
        validator: async (value) => Array.isArray(value),
        default: [],
    },
    {
        value: 'integer',
        label: 'Integer',
        validator: async (value) => !!value.match(/^\d+$/),
        default: '',
    },
    {
        value: 'number',
        label: 'Number',
        validator: async (value) => !!value.match(/^\d+(?:\.\d+)?$/),
        default: '',
    },
    {
        value: 'time',
        label: 'Time',
        validator: async (value) => !!value.match(/^\d{2}:\d{2}$/),
        default: '',
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
        default: null,
    },
    {
        value: 'rich_text_line',
        label: 'Rich Text Line',
        validator: async (value) => true,
        default: null,
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
            isDeprecated: false,
        };
    }

    static async updateWhere(where) {
        await Base.updateWhere.call(this, where, {
            id: 'id',
            logStructureGroup: 'group_id',
            name: 'name',
            isPeriodic: 'is_periodic',
            logMode: 'mode_id',
            isDeprecated: 'is_deprecated',
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

        if (inputLogStructure.logStructureGroup) {
            const logStructureGroupResults = await Base.validateRecursive.call(
                this, LogStructureGroup, '.logStructureGroup', inputLogStructure.logStructureGroup,
            );
            results.push(...logStructureGroupResults);
        } else {
            results.push([
                '.logStructureGroup',
                false,
                'must be provided!',
            ]);
        }

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
        if (inputLogStructure.logStructureGroup) {
            const modeValidationResults = await this.invoke.call(
                this,
                'validate-log-topic-modes',
                { logMode: inputLogStructure.logStructureGroup.logMode, targetLogTopics },
            );
            results.push(...modeValidationResults);
        }

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
                (logKey, index) => LogStructure.loadKey.call(this, logKey, index + 1),
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
            isDeprecated: logStructure.is_deprecated,
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

        // isVirtualItem

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
            is_deprecated: inputLogStructure.isDeprecated,
        };

        // Fetch affected logEvents BEFORE updating the database.
        // Why? To prevent loading the new log-structure from the log-event.
        let inputLogEvents = null;
        if (originalLogStructure) {
            let shouldRegenerateLogEvents = false;
            if (!shouldRegenerateLogEvents) {
                shouldRegenerateLogEvents = (
                    originalLogStructure.name !== fields.name
                    || originalLogStructure.keys !== fields.keys
                );
            }
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
                    originalLogStructure.log_level !== fields.log_level
                    || originalLogStructure.mode_id !== fields.mode_id
                );
            }
            if (shouldRegenerateLogEvents) {
                inputLogEvents = await this.invoke.call(
                    this,
                    'log-event-list',
                    { where: { logStructure: inputLogStructure } },
                );
            }
        }

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
            if (inputLogEvents) {
                await Promise.all(inputLogEvents.map(async (inputLogEvent) => {
                    // Update the logEvent to support logKey addition, reorder, deletion.
                    const mapping = {};
                    inputLogEvent.logStructure.logKeys.forEach((logKey) => {
                        mapping[logKey.id] = logKey;
                    });
                    inputLogEvent.logStructure = {
                        ...inputLogStructure,
                        logKeys: inputLogStructure.logKeys.map((logKey) => ({
                            ...logKey,
                            value: (mapping[logKey.id] || logKey).value,
                        })),
                    };
                    return this.invoke.call(this, 'log-event-upsert', inputLogEvent);
                }));
            }
        } else {
            // On creation, replace the virtual ID in the title template.
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

    static createNewKey() {
        return {
            __type__: 'log-structure-key',
            id: getVirtualID(),
            name: '',
            type: LogStructureKey.STRING,
            isOptional: false,
            template: null,
            parentLogTopic: null,
        };
    }

    static async loadKey(rawLogKey, index) {
        let parentLogTopic = null;
        if (rawLogKey.parent_topic_id) {
            parentLogTopic = await this.invoke.call(this, 'log-topic-load', {
                id: rawLogKey.parent_topic_id,
            });
        }
        return {
            __type__: 'log-structure-key',
            id: index,
            name: rawLogKey.name,
            type: rawLogKey.type,
            template: rawLogKey.template,
            isOptional: rawLogKey.is_optional,
            parentLogTopic,
        };
    }

    static saveKey(inputLogKey) {
        return {
            name: inputLogKey.name,
            type: inputLogKey.type,
            is_optional: inputLogKey.isOptional,
            template: inputLogKey.template,
            parent_topic_id: inputLogKey.parentLogTopic ? inputLogKey.parentLogTopic.id : null,
        };
    }
}

LogStructure.Key = LogStructureKey;
LogStructure.Frequency = Frequency;
LogStructure.LogLevel = LogLevel;

export default LogStructure;
