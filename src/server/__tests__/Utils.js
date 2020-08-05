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
        };
        const database = await Database.init(config);
        actions = new Actions({ database });
    }

    static getActions() {
        return actions;
    }

    static async afterEach() {
        if (actions) await actions.context.database.close();
    }

    static async loadData(data) {
        const logTopicsMap = {};
        const logTopics = [null];
        await awaitSequence(data.logTopics, async (inputLogTopic) => {
            inputLogTopic.id = getVirtualID();
            if (inputLogTopic.parentTopicName) {
                inputLogTopic.parentLogTopic = logTopicsMap[inputLogTopic.parentTopicName];
                delete inputLogTopic.parentTopicName;
            }
            inputLogTopic.details = TextEditorUtils.convertPlainTextToDraftContent(
                inputLogTopic.details || '',
                { '#': logTopics },
            );
            inputLogTopic.onSidebar = false;
            inputLogTopic.hasStructure = false;
            const outputLogTopic = await actions.invoke('log-topic-upsert', inputLogTopic);
            logTopicsMap[outputLogTopic.name] = outputLogTopic;
            logTopics.push(outputLogTopic);
        });

        const logStructureGroupMap = {};
        await awaitSequence(data.logStructureGroups, async (inputLogStructureGroup) => {
            inputLogStructureGroup.id = getVirtualID();
            const outputLogStructureGroup = await actions.invoke(
                'log-structure-group-upsert',
                inputLogStructureGroup,
            );
            logStructureGroupMap[outputLogStructureGroup.name] = outputLogStructureGroup;
        });

        const logStructureMap = {};
        await awaitSequence(data.logStructures, async (inputLogStructure) => {
            inputLogStructure.__type__ = 'log-structure';
            inputLogStructure.id = getVirtualID();
            inputLogStructure.logStructureGroup = logStructureGroupMap[inputLogStructure.groupName];
            delete inputLogStructure.groupName;
            inputLogStructure.details = '';
            if (inputLogStructure.logKeys) {
                inputLogStructure.logKeys.forEach((logKey, index) => {
                    logKey.__type__ = 'log-structure-key';
                    logKey.id = index;
                    if (logKey.parentTopicName) {
                        logKey.parentLogTopic = logTopicsMap[logKey.parentTopicName];
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

            inputLogStructure.isPeriodic = inputLogStructure.isPeriodic || false;
            inputLogStructure.reminderText = inputLogStructure.reminderText || null;
            inputLogStructure.frequency = inputLogStructure.frequency || null;
            inputLogStructure.lastUpdate = inputLogStructure.lastUpdate || null;
            DateUtils.maybeSubstitute(inputLogStructure, 'lastUpdate');

            inputLogStructure.isMajor = false;
            const outputLogStructure = await actions.invoke('log-structure-upsert', inputLogStructure);
            logStructureMap[outputLogStructure.name] = outputLogStructure;
        });

        await awaitSequence(data.logEvents, async (inputLogEvent) => {
            inputLogEvent.id = getVirtualID();
            DateUtils.maybeSubstitute(inputLogEvent, 'date');
            inputLogEvent.title = TextEditorUtils.convertPlainTextToDraftContent(
                inputLogEvent.title || '',
                { '#': logTopics },
            );
            inputLogEvent.details = TextEditorUtils.convertPlainTextToDraftContent(
                inputLogEvent.details || '',
                { '#': logTopics },
            );
            inputLogEvent.isMajor = false;
            inputLogEvent.onSidebar = false;
            inputLogEvent.isComplete = getBool(inputLogEvent, 'isComplete', true);
            if (inputLogEvent.structureName) {
                inputLogEvent.logStructure = logStructureMap[inputLogEvent.structureName];
                if (inputLogEvent.logValues) {
                    inputLogEvent.logValues.forEach((value, index) => {
                        const logKey = inputLogEvent.logStructure.logKeys[index];
                        if (logKey.type === LogStructure.Key.LOG_TOPIC) {
                            logKey.value = logTopicsMap[value];
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
