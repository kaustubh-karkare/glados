import {
    asyncSequence, getVirtualID, getPartialItem, isVirtualItem,
} from './Utils';
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
        getDefault: () => '',
    },
    {
        value: 'string_list',
        label: 'String List',
        validator: async (value) => Array.isArray(value),
        getDefault: () => [],
    },
    {
        value: 'integer',
        label: 'Integer',
        validator: async (value) => !!value.match(/^\d+$/),
        getDefault: () => '',
    },
    {
        value: 'number',
        label: 'Number',
        validator: async (value) => !!value.match(/^\d+(?:\.\d+)?$/),
        getDefault: () => '',
    },
    {
        value: 'time',
        label: 'Time',
        validator: async (value) => !!value.match(/^\d{2}:\d{2}$/),
        getDefault: () => '',
    },
    {
        value: 'yes_or_no',
        label: 'Yes / No',
        validator: async (value) => !!value.match(/^(?:yes|no)$/),
        getDefault: () => 'no',
    },
    {
        value: 'enum',
        label: 'Enum',
        validator: async (value, logKey) => logKey.enumValues.includes(value),
        getDefault: (logKey) => logKey.enumValues[0],
    },
    {
        value: 'log_topic',
        label: 'Topic',
        validator: async (value, logKey, that) => {
            const logTopic = await that.invoke.call(that, 'log-topic-load', value);
            return logTopic.parentLogTopic.__id__ === logKey.parentLogTopic.__id__;
        },
        getDefault: () => null,
    },
    {
        value: 'rich_text_line',
        label: 'Rich Text Line',
        validator: async (value) => true,
        getDefault: () => null,
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
            __id__: getVirtualID(),
            logStructureGroup,
            name,
            details: null,
            allowEventDetails: false,
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
            isFavorite: false,
            isDeprecated: false,
        };
    }

    static async updateWhere(where) {
        await Base.updateWhere.call(this, where, {
            __id__: 'id',
            logStructureGroup: 'group_id',
            name: 'name',
            isPeriodic: 'is_periodic',
            logMode: 'mode_id',
            isFavorite: 'is_favorite',
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
                logTopics[logKey.parentLogTopic.__id__] = logKey.parentLogTopic;
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
            if (logKey.type === LogStructureKey.ENUM) {
                results.push([
                    `${prefix}.enumValues`,
                    logKey.enumValues.length > 0,
                    'must be provided!',
                ]);
            } if (logKey.type === LogStructureKey.LOG_TOPIC) {
                results.push([
                    `${prefix}.parentLogTopic`,
                    logKey.parentLogTopic,
                    'must be provided!',
                ]);
            }
        });

        results.push([
            '.titleTemplate',
            inputLogStructure.__id__ in TextEditorUtils.extractMentions(
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

        if (inputLogStructure.logStructureGroup && inputLogStructure.logStructureGroup.logMode) {
            const targetLogTopics = LogStructure.extractLogTopics(inputLogStructure);
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
            { __id__: logStructure.group_id },
        );
        const logKeys = await Promise.all(
            JSON.parse(logStructure.keys).map(
                (logKey, index) => LogStructure.loadKey.call(this, logKey, index + 1),
            ),
        );
        return {
            __type__: 'log-structure',
            __id__: logStructure.id,
            logStructureGroup: outputLogStructureGroup,
            name: logStructure.name,
            details: TextEditorUtils.deserialize(
                logStructure.details,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            allowEventDetails: logStructure.allow_event_details,
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
            isFavorite: logStructure.is_favorite,
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
            { group_id: inputLogStructure.logStructureGroup.__id__ },
        );

        // isVirtualItem

        const orderingIndex = await Base.getOrderingIndex.call(this, logStructure);
        const fields = {
            mode_id: inputLogStructure.logStructureGroup.logMode
                && inputLogStructure.logStructureGroup.logMode.__id__,
            group_id: inputLogStructure.logStructureGroup.__id__,
            ordering_index: orderingIndex,
            name: inputLogStructure.name,
            details: TextEditorUtils.serialize(
                inputLogStructure.details,
                TextEditorUtils.StorageType.DRAFTJS,
            ),
            allow_event_details: inputLogStructure.allowEventDetails,
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
            is_favorite: inputLogStructure.isFavorite,
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
                    || originalLogStructure.allow_event_details !== fields.allow_event_details
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
                result[targetLogTopic.__id__] = {};
                return result;
            }, {}),
        );

        if (
            !originalLogStructure
            || inputLogStructure.logKeys.some((logKey) => isVirtualItem(logKey))
        ) {
            // On creation of logStructure or update of logKeys,
            // replace the virtual IDs in the title template.
            const originalItems = [inputLogStructure, ...inputLogStructure.logKeys];
            const updatedItems = originalItems.map((item, index) => ({
                ...getPartialItem(item),
                __id__: index || updatedLogStructure.id,
            }));
            const updatedTitleTemplate = TextEditorUtils.updateDraftContent(
                inputLogStructure.titleTemplate,
                originalItems,
                updatedItems,
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

        if (originalLogStructure && inputLogEvents) {
            await asyncSequence(inputLogEvents, async (inputLogEvent) => {
                // Update the logEvent to support logKey addition, reorder, deletion.
                const mapping = {};
                inputLogEvent.logStructure.logKeys.forEach((logKey) => {
                    mapping[logKey.__id__] = logKey;
                });
                inputLogEvent.logStructure = {
                    ...inputLogStructure,
                    logKeys: inputLogStructure.logKeys.map((logKey) => ({
                        ...logKey,
                        value: (mapping[logKey.__id__] || logKey).value,
                    })),
                };
                return this.invoke.call(this, 'log-event-upsert', inputLogEvent);
            });
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
            __id__: getVirtualID(),
            name: '',
            type: LogStructureKey.STRING,
            isOptional: false,
            template: null,
            enumValues: [],
            parentLogTopic: null,
        };
    }

    static async loadKey(rawLogKey, index) {
        let parentLogTopic = null;
        if (rawLogKey.parent_topic_id) {
            parentLogTopic = await this.invoke.call(this, 'log-topic-load', {
                __id__: rawLogKey.parent_topic_id,
            });
        }
        return {
            __type__: 'log-structure-key',
            __id__: index,
            name: rawLogKey.name,
            type: rawLogKey.type,
            template: rawLogKey.template,
            isOptional: rawLogKey.is_optional,
            enumValues: rawLogKey.enum_values || [],
            parentLogTopic,
        };
    }

    static saveKey(inputLogKey) {
        return {
            name: inputLogKey.name,
            type: inputLogKey.type,
            is_optional: inputLogKey.isOptional,
            template: inputLogKey.template,
            enum_values: inputLogKey.enumValues,
            parent_topic_id: inputLogKey.parentLogTopic ? inputLogKey.parentLogTopic.__id__ : null,
        };
    }
}

LogStructure.Key = LogStructureKey;
LogStructure.Frequency = Frequency;
LogStructure.LogLevel = LogLevel;

export default LogStructure;
