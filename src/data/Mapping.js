import LogStructure from './LogStructure';
import LogEntry from './LogEntry';
import LogKey from './LogKey';
import LogReminder from './LogReminder';
import LogReminderGroup from './LogReminderGroup';
import LogTag from './LogTag';
import LogValue from './LogValue';

export {
    LogStructure, LogEntry, LogKey, LogReminder, LogReminderGroup, LogTag, LogValue,
};

const Mapping = {
    'log-structure': LogStructure,
    'log-entry': LogEntry,
    'log-key': LogKey,
    'log-reminder': LogReminder,
    'log-reminder-group': LogReminderGroup,
    'log-tag': LogTag,
    'log-value': LogValue,
};

export function getDataTypeMapping() {
    return Mapping;
}
