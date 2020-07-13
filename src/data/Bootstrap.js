import { maybeSubstitute } from '../common/DateUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import { awaitSequence, getVirtualID } from './Utils';
import {
    convertDraftContentToPlainText,
    convertPlainTextToDraftContent,
} from '../common/DraftContentUtils';


function convertPlainTextToDraftContent2(value, symbolToMapping) {
    if (!value) {
        return value;
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


async function loadData(actions, data) {
    const logStructureMap = {};
    await awaitSequence(data.logStructures, async (inputLogStructure) => {
        inputLogStructure.id = getVirtualID();
        if (inputLogStructure.logKeys) {
            inputLogStructure.logKeys.forEach((logKey, index) => {
                logKey.__type__ = 'log-structure-key';
                logKey.id = index;
            });
        } else {
            inputLogStructure.logKeys = [];
        }
        inputLogStructure.titleTemplate = convertPlainTextToDraftContent2(
            inputLogStructure.titleTemplate || '',
            { $: inputLogStructure.logKeys },
        );
        inputLogStructure.isIndirectlyManaged = false;
        const outputLogStructure = await actions.invoke('log-structure-upsert', inputLogStructure);
        logStructureMap[outputLogStructure.name] = outputLogStructure;
    });

    const logTopicsMap = {};
    const logTopics = await awaitSequence(data.logTopics, async (inputLogTopic) => {
        inputLogTopic.id = getVirtualID();
        if (inputLogTopic.parentTopicName) {
            inputLogTopic.parentLogTopic = logTopicsMap[inputLogTopic.parentTopicName];
            delete inputLogTopic.parentTopicName;
        }
        if (inputLogTopic.structureName) {
            inputLogTopic.logStructure = logStructureMap[inputLogTopic.structureName];
            delete inputLogTopic.structureName;
        }
        inputLogTopic.details = inputLogTopic.details || '';
        inputLogTopic.onSidebar = false;
        inputLogTopic.isMajor = true;
        inputLogTopic.isPeriodicReminder = false;
        const outputLogTopic = await actions.invoke('log-topic-upsert', inputLogTopic);
        logTopicsMap[outputLogTopic.name] = outputLogTopic;
        return outputLogTopic;
    });

    await awaitSequence(data.logEvents, async (inputLogEvent) => {
        inputLogEvent.id = getVirtualID();
        maybeSubstitute(inputLogEvent, 'date');
        inputLogEvent.title = convertPlainTextToDraftContent2(inputLogEvent.title, { '#': logTopics });
        inputLogEvent.details = convertPlainTextToDraftContent2(inputLogEvent.details, { '#': logTopics });
        inputLogEvent.isMajor = false;
        if (inputLogEvent.structure) {
            inputLogEvent.logStructure = logStructureMap[inputLogEvent.structure];
            if (inputLogEvent.logValues) {
                inputLogEvent.logValues.forEach((value, index) => {
                    inputLogEvent.logStructure.logKeys[index].value = value;
                });
            }
        }
        await actions.invoke('log-event-upsert', inputLogEvent);
    });

    await awaitSequence(data.logReminders, async (inputLogReminder) => {
        inputLogReminder.id = getVirtualID();
        inputLogReminder.title = TextEditorUtils.serialize(
            inputLogReminder.title,
            TextEditorUtils.StorageType.PLAINTEXT,
        );
        inputLogReminder.isMajor = false;
        if (inputLogReminder.structure) {
            inputLogReminder.logStructure = logStructureMap[inputLogReminder.structure];
            inputLogReminder.logStructure.isIndirectlyManaged = true;
        }
        if (inputLogReminder.parentTopicName) {
            inputLogReminder.parentLogTopic = logTopicsMap[
                inputLogReminder.parentTopicName
            ];
            delete inputLogReminder.parentTopicName;
        }
        maybeSubstitute(inputLogReminder, 'deadline');
        maybeSubstitute(inputLogReminder, 'lastUpdate');
        inputLogReminder.needsEdit = inputLogReminder.needsEdit || false;
        await actions.invoke('log-reminder-upsert', inputLogReminder);
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
    result.logTopics = logTopics.map((logTopic) => {
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

    const logStructures = await actions.invoke('log-structure-list');
    result.logStructures = logStructures.map((logStructure) => {
        const item = { name: logStructure.name };
        if (logStructure.logKeys) {
            item.logKeys = logStructure.logKeys.map((logKey) => {
                const outputLogKey = { name: logKey.name, type: logKey.type };
                return outputLogKey;
            });
        }
        if (logStructure.titleTemplate) {
            item.titleTemplate = convertDraftContentToPlainText2(
                logStructure.titleTemplate,
                { $: logStructure.logKeys, '#': logTopics },
            );
        }
        return item;
    });

    const logEvents = await actions.invoke('log-event-list');
    result.logEvents = logEvents.map((logEvent) => {
        const item = {};
        if (logEvent.date) {
            item.date = logEvent.date;
        }
        item.title = convertDraftContentToPlainText2(logEvent.title, { '#': logTopics });
        if (logEvent.details) {
            item.details = convertDraftContentToPlainText2(logEvent.details, { '#': logTopics });
        }
        if (logEvent.logStructure) {
            item.structure = logEvent.logStructure.name;
            item.logValues = [];
            logEvent.logStructure.logKeys.forEach((logKey) => {
                item.logValues.push(logKey.value);
                delete logKey.value;
            });
            if (logEvent.logStructure.titleTemplate) {
                delete item.title;
            }
        }
        if (logEvent.logReminder) {
            // get rid of the undefined values
            item.logReminder = JSON.parse(JSON.stringify(logEvent.logReminder));
            item.logReminder.group = logEvent.logReminder.logReminderGroup.name;
            delete item.logReminder.logReminderGroup;
            if (!item.logReminder.needsEdit) {
                delete item.logReminder.needsEdit;
            }
        }
        return item;
    });

    const logReminders = await actions.invoke('log-reminder-list');
    result.logReminders = logReminders.map((logReminder) => {
        const item = {};
        item.title = TextEditorUtils.deserialize(
            logReminder.title,
            TextEditorUtils.StorageType.PLAINTEXT,
        );
        if (logReminder.logStructure) {
            item.structure = logReminder.logStructure.name;
        }
        item.parentTopicName = logReminder.parentLogTopic.name;
        item.type = logReminder.type;
        if (logReminder.deadline) item.deadline = logReminder.deadline;
        if (logReminder.warning) item.warning = logReminder.warning;
        if (logReminder.frequency) item.frequency = logReminder.frequency;
        if (logReminder.lastUpdate) item.lastUpdate = logReminder.lastUpdate;
        if (logReminder.needsEdit) item.needsEdit = true;
        return item;
    });

    return result;
}


export { loadData, saveData };
