import LogStructure from './LogStructure';
import { maybeSubstitute } from '../common/DateUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import { awaitSequence, getVirtualID, isRealItem } from './Utils';
import {
    convertDraftContentToPlainText,
    convertPlainTextToDraftContent,
} from '../common/TemplateUtils';

async function loadData(actions, data) {
    const logStructureMap = {};
    await awaitSequence(data.logStructures, async (inputLogStructure) => {
        inputLogStructure.id = getVirtualID();
        inputLogStructure.logKeys = inputLogStructure.logKeys.map(
            (logKey) => ({ ...logKey, id: getVirtualID() }),
        );
        if (inputLogStructure.titleTemplate) {
            const content = convertPlainTextToDraftContent(
                inputLogStructure.titleTemplate, inputLogStructure.logKeys,
            );
            inputLogStructure.titleTemplate = TextEditorUtils.serialize(
                content,
                TextEditorUtils.StorageType.DRAFTJS,
            );
        }
        const outputLogStructure = await actions.invoke('log-structure-upsert', inputLogStructure);
        logStructureMap[outputLogStructure.name] = outputLogStructure;
    });

    await awaitSequence(data.logTags, async (logTag) => {
        logTag.id = getVirtualID();
        return actions.invoke('log-tag-upsert', logTag);
    });

    await awaitSequence(data.logEntries, async (inputLogEntry) => {
        inputLogEntry.id = getVirtualID();
        maybeSubstitute(inputLogEntry, 'date');
        inputLogEntry.title = TextEditorUtils.serialize(
            inputLogEntry.title,
            TextEditorUtils.StorageType.PLAINTEXT, // TODO: use DRAFTJS here!
        );
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
        inputLogEntry.details = inputLogEntry.details || '';
        await actions.invoke('log-entry-upsert', inputLogEntry);
    });

    const logReminderGroupMap = {};
    await awaitSequence(data.logReminderGroups, async (inputLogReminderGroup) => {
        inputLogReminderGroup.id = getVirtualID();
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


async function saveData(actions) {
    const result = {};

    const logStructures = await actions.invoke('log-structure-list');
    result.logStructures = logStructures.map((logStructure) => {
        let titleTemplate = '';
        if (logStructure.titleTemplate) {
            const content = TextEditorUtils.deserialize(
                logStructure.titleTemplate,
                TextEditorUtils.StorageType.DRAFTJS,
            );
            titleTemplate = convertDraftContentToPlainText(
                content,
                logStructure.logKeys,
            );
            // Don't serialize!
        }
        return {
            name: logStructure.name,
            logKeys: logStructure.logKeys.map((logKey) => ({
                name: logKey.name, type: logKey.type,
            })),
            titleTemplate,
        };
    });

    const logTags = await actions.invoke('log-tag-list');
    result.logTags = logTags.map((logTag) => ({
        name: logTag.name,
        type: logTag.type,
    }));

    const logEntries = await actions.invoke('log-entry-list');
    result.logEntries = logEntries.map((logEntry) => {
        const item = {};
        if (logEntry.date) {
            item.date = logEntry.date;
        }
        item.title = TextEditorUtils.deserialize(
            logEntry.title,
            TextEditorUtils.StorageType.PLAINTEXT,
        );
        if (logEntry.details) {
            item.details = logEntry.details;
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
    result.logReminderGroups = logReminderGroups.map((logReminderGroup) => ({
        name: logReminderGroup.name,
        type: logReminderGroup.type,
    }));

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
