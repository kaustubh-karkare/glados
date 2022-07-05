import { asyncSequence } from '../AsyncUtils';
import RichTextUtils from '../RichTextUtils';
import DataTypeBase from './base';
import Enum from './enum';
import LogKey from './LogKey';
import LogStructureFrequency from './LogStructureFrequency';
import LogStructureGroup from './LogStructureGroup';
import { getPartialItem, getVirtualID, isVirtualItem } from './utils';
import { validateRecursive, validateRecursiveList } from './validation';

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

class LogStructure extends DataTypeBase {
    static createVirtual({ logStructureGroup, name = '' }) {
        return {
            __type__: 'log-structure',
            __id__: getVirtualID(),
            logStructureGroup,
            name,
            details: null,
            allowEventDetails: false,
            eventKeys: [],
            titleTemplate: null,
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
        await DataTypeBase.updateWhere.call(this, where, {
            __id__: 'id',
            logStructureGroup: 'group_id',
            name: 'name',
            isPeriodic: 'is_periodic',
            isFavorite: 'is_favorite',
            isDeprecated: 'is_deprecated',
        });
    }

    static trigger(logStructure) {
        // TODO: If an eventKey is deleted, remove it from the content.
        const options = [getPartialItem(logStructure), ...logStructure.eventKeys];
        if (logStructure.name && !logStructure.titleTemplate) {
            logStructure.titleTemplate = RichTextUtils.convertPlainTextToDraftContent('$0', {
                $: [logStructure],
            });
        }
        logStructure.titleTemplate = RichTextUtils.updateDraftContent(
            logStructure.titleTemplate,
            options,
            options,
        );
        if (logStructure.eventKeys.length) {
            logStructure.needsEdit = true;
        }
    }

    static extractLogTopics(inputLogStructure) {
        const logTopics = {
            ...RichTextUtils.extractMentions(inputLogStructure.titleTemplate, 'log-topic'),
            ...RichTextUtils.extractMentions(inputLogStructure.details, 'log-topic'),
        };
        inputLogStructure.eventKeys.forEach((eventKey) => {
            if (eventKey.type === LogKey.Type.LOG_TOPIC && eventKey.parentLogTopic) {
                logTopics[eventKey.parentLogTopic.__id__] = eventKey.parentLogTopic;
            }
        });
        return logTopics;
    }

    static async validate(inputLogStructure) {
        const results = [];

        if (inputLogStructure.logStructureGroup) {
            const logStructureGroupResults = await validateRecursive.call(
                this,
                LogStructureGroup,
                '.logStructureGroup',
                inputLogStructure.logStructureGroup,
            );
            results.push(...logStructureGroupResults);
        } else {
            results.push([
                '.logStructureGroup',
                false,
                'must be provided!',
            ]);
        }

        results.push(...await validateRecursiveList.call(
            this,
            LogKey,
            '.eventKeys',
            inputLogStructure.eventKeys,
        ));

        results.push([
            '.titleTemplate',
            inputLogStructure.__id__ in RichTextUtils.extractMentions(
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

        return results;
    }

    static async load(id) {
        const logStructure = await this.database.findByPk('LogStructure', id);
        const outputLogStructureGroup = await this.invoke.call(
            this,
            'log-structure-group-load',
            { __id__: logStructure.group_id },
        );
        const eventKeys = await Promise.all(
            JSON.parse(logStructure.event_keys).map(
                (eventKey, index) => LogKey.load.call(this, eventKey, index + 1),
            ),
        );
        return {
            __type__: 'log-structure',
            __id__: logStructure.id,
            logStructureGroup: outputLogStructureGroup,
            name: logStructure.name,
            details: RichTextUtils.deserialize(
                logStructure.details,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            allowEventDetails: logStructure.event_allow_details,
            eventKeys,
            titleTemplate: RichTextUtils.deserialize(
                logStructure.event_title_template,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            needsEdit: logStructure.event_needs_edit,
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

        DataTypeBase.broadcast.call(
            this,
            'log-structure-list',
            logStructure,
            { group_id: inputLogStructure.logStructureGroup.__id__ },
        );

        const orderingIndex = await DataTypeBase.getOrderingIndex.call(this, logStructure);
        const updated = {
            group_id: inputLogStructure.logStructureGroup.__id__,
            ordering_index: orderingIndex,
            name: inputLogStructure.name,
            details: RichTextUtils.serialize(
                inputLogStructure.details,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            event_allow_details: inputLogStructure.allowEventDetails,
            event_keys: JSON.stringify(inputLogStructure.eventKeys.map(
                (eventKey) => LogKey.save.call(this, eventKey),
            )),
            event_title_template: RichTextUtils.serialize(
                inputLogStructure.titleTemplate,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            event_needs_edit: inputLogStructure.needsEdit,
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
                    originalLogStructure.name !== updated.name
                    || originalLogStructure.event_keys !== updated.event_keys
                );
            }
            if (!shouldRegenerateLogEvents) {
                const originalTitleTemplate = RichTextUtils.deserialize(
                    originalLogStructure.event_title_template,
                    RichTextUtils.StorageType.DRAFTJS,
                );
                shouldRegenerateLogEvents = !RichTextUtils.equals(
                    originalTitleTemplate,
                    inputLogStructure.titleTemplate,
                );
            }
            if (!shouldRegenerateLogEvents) {
                shouldRegenerateLogEvents = (
                    originalLogStructure.log_level !== updated.log_level
                    || originalLogStructure.allow_event_details !== updated.allow_event_details
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
            'LogStructure', logStructure, updated,
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
            || inputLogStructure.eventKeys.some((eventKey) => isVirtualItem(eventKey))
        ) {
            // On creation of logStructure or update of eventKeys,
            // replace the virtual IDs in the title template.
            const originalItems = [inputLogStructure, ...inputLogStructure.eventKeys];
            const updatedItems = originalItems.map((item, index) => ({
                ...getPartialItem(item),
                __id__: index || updatedLogStructure.id,
            }));
            const updatedTitleTemplate = RichTextUtils.updateDraftContent(
                inputLogStructure.titleTemplate,
                originalItems,
                updatedItems,
            );
            const transaction = this.database.getTransaction();
            const fields2 = {
                event_title_template: RichTextUtils.serialize(
                    updatedTitleTemplate,
                    RichTextUtils.StorageType.DRAFTJS,
                ),
            };
            await updatedLogStructure.update(fields2, { transaction });
        }

        if (inputLogEvents) {
            await asyncSequence(inputLogEvents, async (inputLogEvent) => {
                // Update the logEvent to support eventKey addition, reorder, deletion.
                const mapping = {};
                inputLogEvent.logStructure.eventKeys.forEach((eventKey) => {
                    mapping[eventKey.__id__] = eventKey;
                });
                inputLogEvent.logStructure = {
                    ...inputLogStructure,
                    eventKeys: inputLogStructure.eventKeys.map((eventKey) => ({
                        ...eventKey,
                        value: (mapping[eventKey.__id__] || eventKey).value,
                    })),
                };
                return this.invoke.call(this, 'log-event-upsert', inputLogEvent);
            });
        }

        await this.invoke.call(
            this,
            'structure-value-typeahead-index-$refresh',
            { structure_id: updatedLogStructure.id },
        );

        this.broadcast('reminder-sidebar');
        return updatedLogStructure.id;
    }

    static async delete(id) {
        const logStructure = await this.database.deleteByPk('LogStructure', id);
        DataTypeBase.broadcast.call(this, 'log-structure-list', logStructure, ['group_id']);
        await this.invoke.call(
            this,
            'structure-value-typeahead-index-$refresh',
            { structure_id: logStructure.id },
        );
        return { id: logStructure.id };
    }
}

LogStructure.Frequency = LogStructureFrequency;
LogStructure.LogLevel = LogLevel;

export default LogStructure;
