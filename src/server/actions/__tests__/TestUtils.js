import { asyncSequence } from '../../../common/AsyncUtils';
import { getVirtualID, LogStructure } from '../../../common/data_types';
import DateUtils from '../../../common/DateUtils';
import RichTextUtils from '../../../common/RichTextUtils';
import Actions from '../../actions';
import Database from '../../database';

let actions = null;

function getBool(item, key, defaultValue) {
    return typeof item[key] === 'undefined' ? defaultValue : item[key];
}

export default class TestUtils {
    static async beforeEach() {
        const config = {
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false,
        };
        const database = new Database(config);
        actions = new Actions(null, database);
        await actions.invoke('database-reset');
    }

    static getActions() {
        return actions;
    }

    static async afterEach() {
        if (actions) await actions.database.close();
    }

    static async loadData(data) {
        const { todayDate } = DateUtils.getContext();
        const logTopicMap = {};
        const logTopics = [null];
        const existingLogTopics = await actions.invoke('log-topic-list');
        existingLogTopics.forEach((outputLogTopic) => {
            logTopicMap[outputLogTopic.name] = outputLogTopic;
            logTopics.push(outputLogTopic);
        });
        await asyncSequence(data.logTopics, async (inputLogTopic) => {
            inputLogTopic.__id__ = getVirtualID();
            if (inputLogTopic.parentTopicName) {
                inputLogTopic.parentLogTopic = logTopicMap[inputLogTopic.parentTopicName];
                delete inputLogTopic.parentTopicName;
            }
            inputLogTopic.details = RichTextUtils.convertPlainTextToDraftContent(
                inputLogTopic.details || '',
                { '#': logTopics },
            );
            inputLogTopic.isFavorite = false;
            inputLogTopic.isDeprecated = false;
            inputLogTopic.hasStructure = false;
            const outputLogTopic = await actions.invoke('log-topic-upsert', inputLogTopic);
            logTopicMap[outputLogTopic.name] = outputLogTopic;
            logTopics.push(outputLogTopic);
        });

        const logStructureGroupMap = {};
        const existingLogStructureGroups = await actions.invoke('log-structure-group-list');
        existingLogStructureGroups.forEach((outputLogStructureGroup) => {
            logStructureGroupMap[outputLogStructureGroup.name] = outputLogStructureGroup;
        });
        await asyncSequence(data.logStructureGroups, async (inputLogStructureGroup) => {
            inputLogStructureGroup.__id__ = getVirtualID();
            const outputLogStructureGroup = await actions.invoke(
                'log-structure-group-upsert',
                inputLogStructureGroup,
            );
            logStructureGroupMap[outputLogStructureGroup.name] = outputLogStructureGroup;
        });

        const logStructureMap = {};
        const existingLogStructures = await actions.invoke('log-structure-list');
        existingLogStructures.forEach((outputLogStructure) => {
            logStructureMap[outputLogStructure.name] = outputLogStructure;
        });
        await asyncSequence(data.logStructures, async (inputLogStructure) => {
            inputLogStructure.__type__ = 'log-structure';
            inputLogStructure.__id__ = getVirtualID();
            inputLogStructure.logStructureGroup = logStructureGroupMap[inputLogStructure.groupName];
            delete inputLogStructure.groupName;
            inputLogStructure.details = '';
            inputLogStructure.allowEventDetails = true;
            if (inputLogStructure.logKeys) {
                inputLogStructure.logKeys.forEach((logKey, index) => {
                    logKey.__type__ = 'log-structure-key';
                    logKey.__id__ = index + 1;
                    if (logKey.parentTopicName) {
                        logKey.parentLogTopic = logTopicMap[logKey.parentTopicName];
                        delete logKey.parentTopicName;
                    }
                });
            } else {
                inputLogStructure.logKeys = [];
            }
            inputLogStructure.titleTemplate = RichTextUtils.convertPlainTextToDraftContent(
                inputLogStructure.titleTemplate || '$0',
                { $: [inputLogStructure, ...inputLogStructure.logKeys] },
            );
            inputLogStructure.needsEdit = inputLogStructure.needsEdit || false;
            inputLogStructure.isFavorite = false;
            inputLogStructure.isDeprecated = false;

            inputLogStructure.isPeriodic = inputLogStructure.isPeriodic || false;
            inputLogStructure.reminderText = inputLogStructure.reminderText || null;
            inputLogStructure.frequency = inputLogStructure.frequency || null;
            inputLogStructure.frequencyArgs = inputLogStructure.frequencyArgs || null;
            inputLogStructure.warningDays = inputLogStructure.isPeriodic
                ? (inputLogStructure.warningDays || 0)
                : null;
            inputLogStructure.suppressUntilDate = inputLogStructure.suppressUntilDate || null;
            DateUtils.maybeSubstitute(todayDate, inputLogStructure, 'suppressUntilDate');

            inputLogStructure.logLevel = 0;
            const outputLogStructure = await actions.invoke('log-structure-upsert', inputLogStructure);
            logStructureMap[outputLogStructure.name] = outputLogStructure;
        });

        await asyncSequence(data.logEvents, async (inputLogEvent) => {
            inputLogEvent.__id__ = getVirtualID();
            DateUtils.maybeSubstitute(todayDate, inputLogEvent, 'date');
            inputLogEvent.title = RichTextUtils.convertPlainTextToDraftContent(
                inputLogEvent.title || '',
                { '#': logTopics },
            );
            inputLogEvent.details = RichTextUtils.convertPlainTextToDraftContent(
                inputLogEvent.details || '',
                { '#': logTopics },
            );
            inputLogEvent.logLevel = 0;
            inputLogEvent.isFavorite = false;
            inputLogEvent.isComplete = getBool(inputLogEvent, 'isComplete', true);
            if (inputLogEvent.structureName) {
                inputLogEvent.logStructure = logStructureMap[inputLogEvent.structureName];
                if (inputLogEvent.logValues) {
                    inputLogEvent.logValues.forEach((value, index) => {
                        const logKey = inputLogEvent.logStructure.logKeys[index];
                        if (logKey.type === LogStructure.Key.Type.LOG_TOPIC) {
                            logKey.value = logTopicMap[value];
                        } else {
                            logKey.value = value;
                        }
                    });
                }
            }
            await actions.invoke('log-event-upsert', inputLogEvent);
        });
    }
}
