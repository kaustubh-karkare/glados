import {
    addDays, compareAsc, getDay, isFriday, isMonday, isSaturday, isSunday, subDays,
} from 'date-fns';
import assert from 'assert';
import { getVirtualID, getPartialItem } from './Utils';
import Base from './Base';
import DateUtils from '../common/DateUtils';
import Enum from '../common/Enum';
import LogStructureGroup from './LogStructureGroup';
import TextEditorUtils from '../common/TextEditorUtils';


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
]);

const FrequencyRawOptions = [
    {
        value: 'everyday',
        label: 'Everyday',
        getPreviousMatch(date) {
            return subDays(date, 1);
        },
        getNextMatch(date) {
            return addDays(date, 1);
        },
    },
    {
        value: 'weekdays',
        label: 'Weekdays',
        getPreviousMatch(date) {
            if (isMonday(date)) {
                return subDays(date, 3);
            } if (isSunday(date)) {
                return subDays(date, 2);
            }
            return subDays(date, 1);
        },
        getNextMatch(date) {
            if (isFriday(date)) {
                return addDays(date, 3);
            } if (isSaturday(date)) {
                return addDays(date, 2);
            }
            return addDays(date, 1);
        },
    },
    {
        value: 'weekends',
        label: 'Weekends',
        getPreviousMatch(date) {
            if (isSunday(date)) {
                return subDays(date, 1);
            }
            return subDays(date, getDay(date));
        },
        getNextMatch(date) {
            if (isSaturday(date)) {
                return addDays(date, 1);
            }
            return addDays(date, 6 - getDay(date));
        },
    },
    // TODO: Add more as needed.
];

DateUtils.DaysOfTheWeek.forEach((day, index) => {
    FrequencyRawOptions.push({
        value: day.toLowerCase(),
        label: day,
        getPreviousMatch(date) {
            const diff = (getDay(date) - index + 7) % 7;
            return subDays(date, diff || 7);
        },
        getNextMatch(date) {
            const diff = (index - getDay(date) + 7) % 7;
            return addDays(date, diff || 7);
        },
    });
});

const LogStructureFrequency = Enum(FrequencyRawOptions);


class LogStructure extends Base {
    static createVirtual({ logStructureGroup, name } = {}) {
        return {
            __type__: 'log-structure',
            id: getVirtualID(),
            logStructureGroup,
            name: name || '',
            details: '',
            logKeys: [],
            titleTemplate: '',
            needsEdit: false,
            isPeriodic: false,
            reminderText: null,
            frequency: null,
            lastUpdate: null,
            isMajor: true,
            onSidebar: false,
        };
    }

    static trigger(logStructure) {
        let content = TextEditorUtils.deserialize(
            logStructure.titleTemplate,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        // TODO: If a key is deleted, remove it from the content.
        const options = [getPartialItem(logStructure), ...logStructure.logKeys];
        content = TextEditorUtils.updateDraftContent(content, options, options);
        logStructure.titleTemplate = TextEditorUtils.serialize(
            content,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        if (logStructure.logKeys.length) {
            logStructure.needsEdit = true;
        }
    }

    static async reminderCheck(logStructure) {
        // input = after loading
        assert(logStructure.isPeriodic);
        const today = DateUtils.getTodayDate();
        const lastUpdate = DateUtils.getDate(logStructure.lastUpdate);
        if (compareAsc(today, lastUpdate) <= 0) {
            return false;
        }
        const option = LogStructureFrequency[logStructure.frequency];
        const tomorrow = addDays(today, 1);
        const previousMatch = option.getPreviousMatch(tomorrow);
        // return compareAsc(today, previousMatch) === 0;

        const latestLogEvent = await this.invoke.call(this, 'latest-log-event', { logStructure });
        if (latestLogEvent) {
            const latestLogEventDate = DateUtils.getDate(latestLogEvent.date);
            if (compareAsc(previousMatch, latestLogEventDate) <= 0) {
                return false;
            }
        }
        return true;
    }

    static getLastUpdate(logStructure) {
        assert(logStructure.isPeriodic);
        const today = DateUtils.getTodayDate();
        const option = LogStructureFrequency[logStructure.frequency];
        const nextMatch = option.getNextMatch(today);
        return DateUtils.getLabel(subDays(nextMatch, 1));
    }

    static async validateInternal(inputLogStructure) {
        const results = [];

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

        const content = TextEditorUtils.deserialize(
            inputLogStructure.titleTemplate,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        results.push([
            '.titleTemplate',
            inputLogStructure.id in TextEditorUtils.extractMentions(content, 'log-structure'),
            'must mention the structure!',
        ]);

        if (inputLogStructure.isPeriodic) {
            results.push([
                '.isPeriodic',
                inputLogStructure.frequency !== null && inputLogStructure.lastUpdate !== null,
                'requires frequency & lastUpdate is set.',
            ]);
        } else {
            results.push([
                '.isPeriodic',
                inputLogStructure.frequency === null && inputLogStructure.lastUpdate === null,
                'requires frequency & lastUpdate to be unset.',
            ]);
        }

        return results;
    }

    static async load(id) {
        const logStructure = await this.database.findByPk('LogStructure', id);
        const outputLogStructureGroup = await LogStructureGroup.load.call(
            this, logStructure.group_id,
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
            details: logStructure.details,
            logKeys,
            titleTemplate: logStructure.title_template,
            needsEdit: logStructure.needs_edit,
            isPeriodic: logStructure.is_periodic,
            reminderText: logStructure.reminder_text,
            frequency: logStructure.frequency,
            lastUpdate: logStructure.last_update,
            isMajor: logStructure.is_major,
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
            group_id: inputLogStructure.logStructureGroup.id,
            ordering_index: orderingIndex,
            name: inputLogStructure.name,
            details: inputLogStructure.details,
            keys: JSON.stringify(inputLogStructure.logKeys.map(
                (logKey) => LogStructure.saveKey.call(this, logKey),
            )),
            title_template: inputLogStructure.titleTemplate,
            needs_edit: inputLogStructure.needsEdit,
            is_periodic: inputLogStructure.isPeriodic,
            reminder_text: inputLogStructure.reminderText,
            frequency: inputLogStructure.frequency,
            last_update: inputLogStructure.lastUpdate,
            is_major: inputLogStructure.isMajor,
        };
        const updatedLogStructure = await this.database.createOrUpdateItem(
            'LogStructure', logStructure, fields,
        );

        let updatedTitleTemplate = TextEditorUtils.deserialize(
            inputLogStructure.titleTemplate,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        if (originalLogStructure) {
            let shouldRegenerateLogEventTitles = (
                originalLogStructure.name !== updatedLogStructure.name
                || originalLogStructure.keys !== updatedLogStructure.keys
            );
            if (!shouldRegenerateLogEventTitles) {
                const originalTitleTemplate = TextEditorUtils.deserialize(
                    originalLogStructure.title_template,
                    TextEditorUtils.StorageType.DRAFTJS,
                );
                shouldRegenerateLogEventTitles = TextEditorUtils.equals(
                    originalTitleTemplate,
                    updatedTitleTemplate,
                );
            }
            if (shouldRegenerateLogEventTitles) {
                await LogStructure.updateLogEvents.call(this, logStructure.id);
            }
        } else {
            updatedTitleTemplate = TextEditorUtils.updateDraftContent(
                updatedTitleTemplate,
                [inputLogStructure],
                [{ ...getPartialItem(inputLogStructure), id: updatedLogStructure.id }],
            );
            inputLogStructure.titleTemplate = TextEditorUtils.serialize(
                updatedTitleTemplate,
                TextEditorUtils.StorageType.DRAFTJS,
            );
            const transaction = this.database.getTransaction();
            await updatedLogStructure.update({
                title_template: inputLogStructure.titleTemplate,
            }, { transaction });
        }

        this.broadcast('reminder-sidebar');
        return updatedLogStructure.id;
    }

    static async updateLogEvents(logStructureId) {
        const outputLogEvents = await this.invoke.call(
            this,
            'log-event-list',
            { where: { structure_id: logStructureId } },
        );
        await Promise.all(
            outputLogEvents.map(
                (outputLogEvent) => this.invoke.call(this, 'log-event-upsert', outputLogEvent),
            ),
        );
    }

    static async delete(id) {
        const logStructure = await this.database.deleteByPk('LogStructure', id);
        Base.broadcast.call(this, 'log-structure-list', logStructure, ['group_id']);
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

    static async loadKey(logKey) {
        logKey.__type__ = 'log-structure-key';
        logKey.isOptional = logKey.is_optional;
        delete logKey.is_optional;
        if (logKey.parent_topic_id) {
            logKey.parentLogTopic = await this.invoke.call(this, 'log-topic-load', {
                id: logKey.parent_topic_id,
            });
        }
        delete logKey.parent_topic_id;
        return logKey;
    }

    static saveKey(logKey) {
        delete logKey.__type__;
        logKey.is_optional = logKey.isOptional;
        delete logKey.isOptional;
        if (logKey.parentLogTopic) {
            logKey.parent_topic_id = logKey.parentLogTopic.id;
        }
        delete logKey.parentLogTopic;
        return logKey;
    }
}

LogStructure.Key = LogStructureKey;
LogStructure.Frequency = LogStructureFrequency;

export default LogStructure;
