import LogStructure from './LogStructure';
import LogEntry from './LogEntry';
import LogKey from './LogKey';
import LogReminder from './LogReminder';
import LogTag from './LogTag';
import LogValue from './LogValue';

export {
    LogStructure, LogEntry, LogKey, LogReminder, LogTag, LogValue,
};

const Mapping = {
    'log-structure': LogStructure,
    'log-entry': LogEntry,
    'log-key': LogKey,
    'log-reminder': LogReminder,
    'log-tag': LogTag,
    'log-value': LogValue,
};

export function getDataTypeMapping() {
    return Mapping;
}
