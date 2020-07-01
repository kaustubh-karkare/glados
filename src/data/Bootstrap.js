import LogStructure from './LogStructure';
import { maybeSubstitute } from '../common/DateUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import { awaitSequence, getVirtualID, isRealItem } from './Utils';
import {
    convertDraftContentToPlainText,
    convertPlainTextToDraftContent,
} from '../common/TemplateUtils';


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
    const logTags = await awaitSequence(data.logTags, async (logTag) => {
        logTag.id = getVirtualID();
        return actions.invoke('log-tag-upsert', logTag);
    });

    const logStructureMap = {};
    await awaitSequence(data.logStructures, async (inputLogStructure) => {
        inputLogStructure.id = getVirtualID();
        inputLogStructure.logKeys = inputLogStructure.logKeys.map(
            (logKey) => ({ ...logKey, id: getVirtualID() }),
        );
        inputLogStructure.titleTemplate = convertPlainTextToDraftContent2(
            inputLogStructure.titleTemplate,
            { $: inputLogStructure.logKeys, '#': logTags },
        );
        const outputLogStructure = await actions.invoke('log-structure-upsert', inputLogStructure);
        logStructureMap[outputLogStructure.name] = outputLogStructure;
    });

    await awaitSequence(data.logEntries, async (inputLogEntry) => {
        inputLogEntry.id = getVirtualID();
        maybeSubstitute(inputLogEntry, 'date');
        inputLogEntry.title = convertPlainTextToDraftContent2(inputLogEntry.title, { '#': logTags });
        inputLogEntry.details = convertPlainTextToDraftContent2(inputLogEntry.details, { '#': logTags });
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
            inputLogEntry.logStructure = LogStructure.createVirtual();
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
        inputLogReminder.logStructure = logStructureMap[inputLogReminder.structure];
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

    const logTags = await actions.invoke('log-tag-list');
    result.logTags = logTags.map((logTag) => ({
        name: logTag.name,
        type: logTag.type,
    }));

    const logStructures = await actions.invoke('log-structure-list');
    result.logStructures = logStructures.map((logStructure) => ({
        name: logStructure.name,
        logKeys: logStructure.logKeys.map((logKey) => ({
            name: logKey.name, type: logKey.type,
        })),
        titleTemplate: convertDraftContentToPlainText2(
            logStructure.titleTemplate,
            { $: logStructure.logKeys, '#': logTags },
        ),
    }));

    const logEntries = await actions.invoke('log-entry-list');
    result.logEntries = logEntries.map((logEntry) => {
        const item = {};
        if (logEntry.date) {
            item.date = logEntry.date;
        }
        item.title = convertDraftContentToPlainText2(logEntry.title, { '#': logTags });
        item.details = convertDraftContentToPlainText2(logEntry.details, { '#': logTags });
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
