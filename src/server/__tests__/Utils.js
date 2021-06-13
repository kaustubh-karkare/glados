import DateUtils from '../../common/DateUtils';
import Database from '../Database';
import Actions from '../Actions';
import {
    LogStructure, awaitSequence, getVirtualID,
} from '../../data';
import TextEditorUtils from '../../common/TextEditorUtils';

let actions = null;

function getBool(item, key, defaultValue) {
    return typeof item[key] === 'undefined' ? defaultValue : item[key];
}

export default class Utils {
    static async beforeEach() {
        const config = {
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false,
        };
        const database = new Database(config);
        await database.sequelize.sync(); // create tables
        actions = new Actions(null, database);
    }

    static getActions() {
        return actions;
    }

    static async afterEach() {
        if (actions) await actions.database.close();
    }

    static async loadData(data) {
        const logModeMap = {};
        await awaitSequence(data.logModes, async (inputLogMode) => {
            inputLogMode.id = getVirtualID();
            const outputLogMode = await actions.invoke('log-mode-upsert', inputLogMode);
            logModeMap[outputLogMode.name] = outputLogMode;
        });

        const logTopicMap = {};
        const logTopics = [null];
        const existingLogTopics = await actions.invoke('log-topic-list');
        existingLogTopics.forEach((outputLogTopic) => {
            logTopicMap[outputLogTopic.name] = outputLogTopic;
            logTopics.push(outputLogTopic);
        });
        await awaitSequence(data.logTopics, async (inputLogTopic) => {
            inputLogTopic.id = getVirtualID();
            inputLogTopic.logMode = logModeMap[inputLogTopic.modeName];
            if (inputLogTopic.parentTopicName) {
                inputLogTopic.parentLogTopic = logTopicMap[inputLogTopic.parentTopicName];
                delete inputLogTopic.parentTopicName;
            }
            inputLogTopic.details = TextEditorUtils.convertPlainTextToDraftContent(
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
        await awaitSequence(data.logStructureGroups, async (inputLogStructureGroup) => {
            inputLogStructureGroup.id = getVirtualID();
            inputLogStructureGroup.logMode = logModeMap[inputLogStructureGroup.modeName];
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
        await awaitSequence(data.logStructures, async (inputLogStructure) => {
            inputLogStructure.__type__ = 'log-structure';
            inputLogStructure.id = getVirtualID();
            inputLogStructure.logStructureGroup = logStructureGroupMap[inputLogStructure.groupName];
            delete inputLogStructure.groupName;
            inputLogStructure.details = '';
            if (inputLogStructure.logKeys) {
                inputLogStructure.logKeys.forEach((logKey, index) => {
                    logKey.__type__ = 'log-structure-key';
                    logKey.id = index + 1;
                    if (logKey.parentTopicName) {
                        logKey.parentLogTopic = logTopicMap[logKey.parentTopicName];
                        delete logKey.parentTopicName;
                    }
                });
            } else {
                inputLogStructure.logKeys = [];
            }
            inputLogStructure.titleTemplate = TextEditorUtils.convertPlainTextToDraftContent(
                inputLogStructure.titleTemplate || '$0',
                { $: [inputLogStructure, ...inputLogStructure.logKeys] },
            );
            inputLogStructure.needsEdit = inputLogStructure.needsEdit || false;
            inputLogStructure.isDeprecated = false;

            inputLogStructure.isPeriodic = inputLogStructure.isPeriodic || false;
            inputLogStructure.reminderText = inputLogStructure.reminderText || null;
            inputLogStructure.frequency = inputLogStructure.frequency || null;
            inputLogStructure.frequencyArgs = inputLogStructure.frequencyArgs || null;
            inputLogStructure.warningDays = inputLogStructure.isPeriodic
                ? (inputLogStructure.warningDays || 0)
                : null;
            inputLogStructure.suppressUntilDate = inputLogStructure.suppressUntilDate || null;
            DateUtils.maybeSubstitute(inputLogStructure, 'suppressUntilDate');

            inputLogStructure.logLevel = 0;
            const outputLogStructure = await actions.invoke('log-structure-upsert', inputLogStructure);
            logStructureMap[outputLogStructure.name] = outputLogStructure;
        });

        await awaitSequence(data.logEvents, async (inputLogEvent) => {
            inputLogEvent.id = getVirtualID();
            inputLogEvent.logMode = logModeMap[inputLogEvent.modeName];
            DateUtils.maybeSubstitute(inputLogEvent, 'date');
            inputLogEvent.title = TextEditorUtils.convertPlainTextToDraftContent(
                inputLogEvent.title || '',
                { '#': logTopics },
            );
            inputLogEvent.details = TextEditorUtils.convertPlainTextToDraftContent(
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
                        if (logKey.type === LogStructure.Key.LOG_TOPIC) {
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
