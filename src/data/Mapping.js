import LogStructure from './LogStructure';
import LogEntry from './LogEntry';
import LogKey from './LogKey';
import LogTag from './LogTag';
import LogValue from './LogValue';

export {
    LogStructure, LogEntry, LogKey, LogTag, LogValue,
};

const Mapping = {
    'log-structure': LogStructure,
    'log-entry': LogEntry,
    'log-key': LogKey,
    'log-tag': LogTag,
    'log-value': LogValue,
};

export function getDataTypeMapping() {
    return Mapping;
}
