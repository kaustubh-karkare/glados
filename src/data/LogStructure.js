import Base from './Base';
import { getVirtualID } from './Utils';
import Enum from '../common/Enum';
import TextEditorUtils from '../common/TextEditorUtils';
import LogTopic from './LogTopic';
import LogStructureGroup from './LogStructureGroup';

import {
    DaysOfTheWeek,
    getDateValue,
    getTodayDay,
    getTodayValue,
} from '../common/DateUtils';

const [KeyOptions, KeyType, KeyOptionsMap] = Enum([
    {
        value: 'string',
        label: 'String',
        validator: () => true,
    },
    {
        value: 'integer',
        label: 'Integer',
        validator: (data) => !!data.match(/^\d+$/),
    },
    {
        value: 'number',
        label: 'Number',
        validator: (data) => !!data.match(/^\d+(?:\.\d+)?$/),
    },
]);

const FrequencyRawOptions = [
    {
        value: 'everyday',
        label: 'Everyday',
        check: () => true,
    },
    {
        value: 'weekdays',
        label: 'Weekdays',
        check: () => [1, 2, 3, 4, 5].includes(getTodayDay()),
    },
    {
        value: 'weekends',
        label: 'Weekends',
        check: () => [0, 6].includes(getTodayDay()),
    },
    // TODO: Add more as needed.
];

DaysOfTheWeek.forEach((day, index) => {
    FrequencyRawOptions.push({
        value: day.toLowerCase(),
        label: day,
        check: () => (getTodayDay() === index),
    });
});

const [FrequencyOptions, FrequencyType, FrequencyOptionsMap] = Enum(FrequencyRawOptions);


class LogStructure extends Base {
    static createVirtual({ logStructureGroup, name, logTopic } = {}) {
        return {
            __type__: 'log-structure',
            logStructureGroup,
            id: getVirtualID(),
            logTopic: logTopic || LogTopic.createVirtual({ hasStructure: true }),
            logKeys: [],
            titleTemplate: '',
            isPeriodic: false,
            reminderText: null,
            frequency: null,
            lastUpdate: null,
            isMajor: true,
        };
    }

    static trigger(logStructure) {
        let content = TextEditorUtils.deserialize(
            logStructure.titleTemplate,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        // TODO: If a key is deleted, remove it from the content.
        const options = [logStructure.logTopic, ...logStructure.logKeys];
        content = TextEditorUtils.updateDraftContent(content, options, options);
        logStructure.titleTemplate = TextEditorUtils.serialize(
            content,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        if (logStructure.logKeys.length) {
            logStructure.needsEdit = true;
        }
    }

    static periodicCheck(logStructure) {
        // input = after loading
        if (logStructure.isPeriodic) {
            return getTodayValue() > getDateValue(logStructure.lastUpdate)
                ? FrequencyOptionsMap[logStructure.frequency].check()
                : false;
        }
        return false;
    }

    static async validateInternal(inputLogStructure) {
        const results = [];

        const logTopicResults = await this.validateRecursive(
            LogTopic, '.logTopic', inputLogStructure.logTopic,
        );
        results.push(...logTopicResults);

        inputLogStructure.logKeys.forEach((logKey, index) => {
            const prefix = `.logKey[${index}]`;
            results.push(this.validateNonEmptyString(`${prefix}.name`, logKey.name));
            results.push(this.validateNonEmptyString(`${prefix}.type`, logKey.type));
        });

        const content = TextEditorUtils.deserialize(
            inputLogStructure.titleTemplate,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        results.push([
            '.titleTemplate',
            inputLogStructure.logTopic.id in TextEditorUtils.extractLogTopics(content),
            'must mention the topic!',
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
        const logStructure = await this.database.findByPk('LogStructure', id, this.transaction);
        const outputLogStructure = await LogTopic.load.call(this, logStructure.topic_id);
        const outputLogStructureGroup = await LogStructureGroup.load.call(
            this, logStructure.group_id,
        );
        return {
            __type__: 'log-structure',
            id: logStructure.id,
            logStructureGroup: outputLogStructureGroup,
            logTopic: outputLogStructure,
            logKeys: JSON.parse(logStructure.keys),
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
        let logStructure = await this.database.findItem(
            'LogStructure',
            inputLogStructure,
            this.transaction,
        );

        const prevLogTopicId = logStructure && logStructure.topic_id;
        const nextLogTopicId = await Base.manageEntityBefore.call(
            this, inputLogStructure.logTopic, LogTopic,
        );

        let originalTitleTemplate = null;
        if (logStructure) {
            originalTitleTemplate = TextEditorUtils.deserialize(
                logStructure.titleTemplate,
                TextEditorUtils.StorageType.DRAFTJS,
            );
        }
        let updatedTitleTemplate = TextEditorUtils.deserialize(
            inputLogStructure.titleTemplate,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        updatedTitleTemplate = TextEditorUtils.updateDraftContent(
            updatedTitleTemplate,
            [inputLogStructure.logTopic],
            [{ ...inputLogStructure.logTopic, id: nextLogTopicId }],
        );
        inputLogStructure.titleTemplate = TextEditorUtils.serialize(
            updatedTitleTemplate,
            TextEditorUtils.StorageType.DRAFTJS,
        );

        const orderingIndex = await Base.getOrderingIndex.call(this, logStructure);
        const fields = {
            topic_id: nextLogTopicId,
            group_id: inputLogStructure.logStructureGroup.id,
            ordering_index: orderingIndex,
            keys: JSON.stringify(inputLogStructure.logKeys),
            title_template: inputLogStructure.titleTemplate,
            needs_edit: inputLogStructure.needsEdit,
            is_periodic: inputLogStructure.isPeriodic,
            reminder_text: inputLogStructure.reminderText,
            frequency: inputLogStructure.frequency,
            last_update: inputLogStructure.lastUpdate,
            is_major: inputLogStructure.isMajor,
        };
        logStructure = await this.database.createOrUpdateItem(
            'LogStructure', logStructure, fields, this.transaction,
        );

        await Base.manageEntityAfter.call(
            this, prevLogTopicId, inputLogStructure.logTopic, LogTopic,
        );

        if (
            originalTitleTemplate
            && !TextEditorUtils.equals(originalTitleTemplate, updatedTitleTemplate)
        ) {
            await LogStructure.updateLogEvents.call(this, logStructure.id);
        }

        this.broadcast('log-structure-list');
        return logStructure.id;
    }

    static async updateLogEvents(logStructureId) {
        const outputLogEvents = await this.invoke.call(
            this,
            'log-event-list',
            { selector: { structure_id: logStructureId } },
        );
        await Promise.all(
            outputLogEvents.map(
                (outputLogEvent) => this.invoke.call(this, 'log-event-upsert', outputLogEvent),
            ),
        );
    }

    // Log Structure Keys

    static createNewKey({ index }) {
        return {
            __type__: 'log-structure-key',
            id: index,
            name: '',
            type: KeyType.STRING,
        };
    }
}

LogStructure.KeyOptions = KeyOptions;
LogStructure.KeyType = KeyType;
LogStructure.KeyOptionsMap = KeyOptionsMap;

LogStructure.FrequencyOptions = FrequencyOptions;
LogStructure.FrequencyType = FrequencyType;
LogStructure.FrequencyOptionsMap = FrequencyOptionsMap;

export default LogStructure;
