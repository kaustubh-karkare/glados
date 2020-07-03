import { maybeSubstitute } from '../common/DateUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import { awaitSequence, getVirtualID, isRealItem } from './Utils';
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
    const logTopicGroupMap = {};
    await awaitSequence(data.logTopicGroups, async (inputLogTopicGroup) => {
        inputLogTopicGroup.id = getVirtualID();
        const logTopicGroup = await actions.invoke('log-topic-group-upsert', inputLogTopicGroup);
        logTopicGroupMap[logTopicGroup.name] = logTopicGroup;
    });

    const logTopics = await awaitSequence(data.logTopics, async (inputLogTopic) => {
        inputLogTopic.id = getVirtualID();
        inputLogTopic.logTopicGroup = logTopicGroupMap[inputLogTopic.group];
        inputLogTopic.details = inputLogTopic.details || '';
        return actions.invoke('log-topic-upsert', inputLogTopic);
    });

    const logStructureMap = {};
    await awaitSequence(data.logStructures, async (inputLogStructure) => {
        inputLogStructure.id = getVirtualID();
        if (inputLogStructure.logKeys) {
            inputLogStructure.logKeys = inputLogStructure.logKeys.map(
                (logKey) => ({ ...logKey, id: getVirtualID() }),
            );
        } else {
            inputLogStructure.logKeys = [];
        }
        inputLogStructure.titleTemplate = convertPlainTextToDraftContent2(
            inputLogStructure.titleTemplate,
            { $: inputLogStructure.logKeys, '#': logTopics },
        );
        inputLogStructure.isIndirectlyManaged = false;
        const outputLogStructure = await actions.invoke('log-structure-upsert', inputLogStructure);
        logStructureMap[outputLogStructure.name] = outputLogStructure;
    });

    await awaitSequence(data.logEntries, async (inputLogEntry) => {
        inputLogEntry.id = getVirtualID();
        maybeSubstitute(inputLogEntry, 'date');
        inputLogEntry.title = convertPlainTextToDraftContent2(inputLogEntry.title, { '#': logTopics });
        inputLogEntry.details = convertPlainTextToDraftContent2(inputLogEntry.details, { '#': logTopics });
        if (inputLogEntry.structure) {
            inputLogEntry.logStructure = logStructureMap[inputLogEntry.structure];
            // generate values after structure is set
            inputLogEntry.logValues = inputLogEntry.logValues.map(
                (logValueData, index) => ({
                    id: getVirtualID(),
                    logKey: inputLogEntry.logStructure.logKeys[index],
                    data: logValueData,
                }),
            );
        } else {
            inputLogEntry.logStructure = null;
            inputLogEntry.logValues = [];
        }
        await actions.invoke('log-entry-upsert', inputLogEntry);
    });

    const logReminderGroupMap = {};
    await awaitSequence(data.logReminderGroups, async (inputLogReminderGroup) => {
        inputLogReminderGroup.id = getVirtualID();
        inputLogReminderGroup.onSidebar = inputLogReminderGroup.onSidebar || false;
        const outputLogReminderGroup = await actions.invoke(
            'log-reminder-group-upsert',
            inputLogReminderGroup,
        );
        logReminderGroupMap[outputLogReminderGroup.name] = outputLogReminderGroup;
    });

    await awaitSequence(data.logReminders, async (inputLogReminder) => {
        inputLogReminder.id = getVirtualID();
        inputLogReminder.title = TextEditorUtils.serialize(
            inputLogReminder.title,
            TextEditorUtils.StorageType.PLAINTEXT,
        );
        if (inputLogReminder.structure) {
            inputLogReminder.logStructure = logStructureMap[inputLogReminder.structure];
            inputLogReminder.logStructure.isIndirectlyManaged = true;
        }
        inputLogReminder.logReminderGroup = logReminderGroupMap[
            inputLogReminder.group
        ];
        delete inputLogReminder.group;
        inputLogReminder.type = inputLogReminder.logReminderGroup.type;
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

    const logTopicGroups = await actions.invoke('log-topic-group-list');
    result.logTopicGroups = logTopicGroups.map((logTopic) => ({ name: logTopic.name }));

    const logTopics = await actions.invoke('log-topic-list');
    result.logTopics = logTopics.map((logTopic) => {
        const item = {
            name: logTopic.name,
            group: logTopic.logTopicGroup.name,
        };
        if (logTopic.details) {
            item.details = logTopic.details;
        }
        return item;
    });

    const logStructures = await actions.invoke('log-structure-list');
    result.logStructures = logStructures.map((logStructure) => {
        const item = {
            name: logStructure.name,
            titleTemplate: convertDraftContentToPlainText2(
                logStructure.titleTemplate,
                { $: logStructure.logKeys, '#': logTopics },
            ),
        };
        if (logStructure.logKeys) {
            item.logKeys = logStructure.logKeys.map((logKey) => ({
                name: logKey.name, type: logKey.type,
            }));
        }
        return item;
    });

    const logEntries = await actions.invoke('log-entry-list');
    result.logEntries = logEntries.map((logEntry) => {
        const item = {};
        if (logEntry.date) {
            item.date = logEntry.date;
        }
        item.title = convertDraftContentToPlainText2(logEntry.title, { '#': logTopics });
        if (logEntry.details) {
            item.details = convertDraftContentToPlainText2(logEntry.details, { '#': logTopics });
        }
        if (isRealItem(logEntry.logStructure)) {
            item.structure = logEntry.logStructure.name;
            item.logValues = logEntry.logValues.map((logValue) => logValue.data);
            if (logEntry.logStructure.titleTemplate) {
                delete item.title;
            }
        }
        if (logEntry.logReminder) {
            // get rid of the undefined values
            item.logReminder = JSON.parse(JSON.stringify(logEntry.logReminder));
            item.logReminder.group = logEntry.logReminder.logReminderGroup.name;
            delete item.logReminder.logReminderGroup;
            if (!item.logReminder.needsEdit) {
                delete item.logReminder.needsEdit;
            }
        }
        return item;
    });

    const logReminderGroups = await actions.invoke('log-reminder-group-list');
    result.logReminderGroups = logReminderGroups.map((logReminderGroup) => {
        const item = {
            name: logReminderGroup.name,
            type: logReminderGroup.type,
        };
        if (logReminderGroup.onSidebar) {
            item.onSidebar = true;
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
        item.group = logReminder.logReminderGroup.name;
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
