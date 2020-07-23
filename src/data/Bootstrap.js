import { maybeSubstitute } from '../common/DateUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import { awaitSequence, getVirtualID } from './Utils';
import {
    convertDraftContentToPlainText,
    convertPlainTextToDraftContent,
} from '../common/DraftContentUtils';
import LogTopic from './LogTopic';


function convertPlainTextToDraftContent2(value, symbolToMapping) {
    if (!value) {
        return value || '';
    }
    const content = convertPlainTextToDraftContent(
        value,
        symbolToMapping,
    );
    return TextEditorUtils.serialize(
        content,
        TextEditorUtils.StorageType.DRAFTJS,
    );
}


function getBool(item, key, defaultValue) {
    return typeof item[key] === 'undefined' ? defaultValue : item[key];
}


async function loadData(actions, data) {
    const logTopicsMap = {};
    const logTopics = [null];
    await awaitSequence(data.logTopics, async (inputLogTopic) => {
        inputLogTopic.id = getVirtualID();
        if (inputLogTopic.parentTopicName) {
            inputLogTopic.parentLogTopic = logTopicsMap[inputLogTopic.parentTopicName];
            delete inputLogTopic.parentTopicName;
        }
        inputLogTopic.details = inputLogTopic.details || '';
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
        inputLogStructure.id = getVirtualID();
        inputLogStructure.logStructureGroup = logStructureGroupMap[inputLogStructure.groupName];
        delete inputLogStructure.groupName;
        inputLogStructure.logTopic = LogTopic.createVirtual({
            name: inputLogStructure.name,
            hasStructure: true,
        });
        if (inputLogStructure.logKeys) {
            inputLogStructure.logKeys.forEach((logKey, index) => {
                logKey.__type__ = 'log-structure-key';
                logKey.id = index;
            });
        } else {
            inputLogStructure.logKeys = [];
        }
        inputLogStructure.titleTemplate = convertPlainTextToDraftContent2(
            inputLogStructure.titleTemplate || '$0',
            { $: [inputLogStructure.logTopic, ...inputLogStructure.logKeys] },
        );
        inputLogStructure.needsEdit = inputLogStructure.needsEdit || false;

        inputLogStructure.isPeriodic = inputLogStructure.isPeriodic || false;
        inputLogStructure.reminderText = inputLogStructure.reminderText || null;
        inputLogStructure.frequency = inputLogStructure.frequency || null;
        inputLogStructure.lastUpdate = inputLogStructure.lastUpdate || null;
        maybeSubstitute(inputLogStructure, 'lastUpdate');

        inputLogStructure.isMajor = false;
        const outputLogStructure = await actions.invoke('log-structure-upsert', inputLogStructure);
        logStructureMap[outputLogStructure.logTopic.name] = outputLogStructure;
        logTopics.push(outputLogStructure.logTopic);
    });

    await awaitSequence(data.logEvents, async (inputLogEvent) => {
        inputLogEvent.id = getVirtualID();
        maybeSubstitute(inputLogEvent, 'date');
        inputLogEvent.title = convertPlainTextToDraftContent2(inputLogEvent.title, { '#': logTopics });
        inputLogEvent.details = convertPlainTextToDraftContent2(inputLogEvent.details, { '#': logTopics });
        inputLogEvent.isMajor = false;
        inputLogEvent.isComplete = getBool(inputLogEvent, 'isComplete', true);
        if (inputLogEvent.structureName) {
            inputLogEvent.logStructure = logStructureMap[inputLogEvent.structureName];
            if (inputLogEvent.logValues) {
                inputLogEvent.logValues.forEach((value, index) => {
                    inputLogEvent.logStructure.logKeys[index].value = value;
                });
            }
        }
        await actions.invoke('log-event-upsert', inputLogEvent);
    });
}


function convertDraftContentToPlainText2(value, symbolToMapping) {
    if (!value) {
        return undefined;
    }
    const content = TextEditorUtils.deserialize(
        value,
        TextEditorUtils.StorageType.DRAFTJS,
    );
    return convertDraftContentToPlainText(content, symbolToMapping);
}


async function saveData(actions) {
    const result = {};

    const logTopics = await actions.invoke('log-topic-list');
    logTopics.unshift(null);
    result.logTopics = logTopics
        .filter((logTopic) => logTopic && !logTopic.hasStructure)
        .map((logTopic) => {
            const item = { name: logTopic.name };
            if (logTopic.details) {
                item.details = logTopic.details;
            }
            if (logTopic.parentLogTopic) {
                item.parentTopicName = logTopic.parentLogTopic.name;
            }
            if (logTopic.logStructure) {
                item.structureName = logTopic.logStructure.name;
            }
            return item;
        });

    const logStructureGroups = await actions.invoke('log-structure-group-list');
    result.logStructureGroups = logStructureGroups.map((logStructureGroup) => {
        const item = { name: logStructureGroup.name };
        return item;
    });

    const logStructures = await actions.invoke('log-structure-list');
    result.logStructures = logStructures.map((logStructure) => {
        const item = {};
        item.groupName = logStructure.logStructureGroup.name;
        item.name = logStructure.logTopic.name;
        if (logStructure.logKeys) {
            item.logKeys = logStructure.logKeys.map((logKey) => {
                const outputLogKey = { name: logKey.name, type: logKey.type };
                return outputLogKey;
            });
        }
        if (logStructure.titleTemplate) {
            item.titleTemplate = convertDraftContentToPlainText2(
                logStructure.titleTemplate,
                { $: [logStructure.logTopic, ...logStructure.logKeys], '#': logTopics },
            );
        }
        if (logStructure.isPeriodic) {
            item.isPeriodic = true;
            if (logStructure.reminderText) item.reminderText = logStructure.reminderText;
            item.frequency = logStructure.frequency;
            item.lastUpdate = logStructure.lastUpdate;
        }
        return item;
    });

    const logEvents = await actions.invoke('log-event-list');
    result.logEvents = logEvents.map((logEvent) => {
        const item = {};
        item.date = logEvent.date;
        if (logEvent.details) {
            item.details = convertDraftContentToPlainText2(logEvent.details, { '#': logTopics });
        }
        if (logEvent.logStructure) {
            item.structureName = logEvent.logStructure.logTopic.name;
            item.logValues = [];
            logEvent.logStructure.logKeys.forEach((logKey) => {
                item.logValues.push(logKey.value);
                delete logKey.value;
            });
            if (logEvent.logStructure.titleTemplate) {
                delete item.title;
            }
        } else {
            item.title = convertDraftContentToPlainText2(logEvent.title, { '#': logTopics });
        }
        if (!logEvent.isComplete) {
            item.isComplete = false;
        }
        return item;
    });

    return result;
}


export { loadData, saveData };
