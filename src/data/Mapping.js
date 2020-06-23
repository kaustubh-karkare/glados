import LogCategory from './LogCategory';
import LogEntry from './LogEntry';
import LogKey from './LogKey';
import LogTag from './LogTag';
import LogValue from './LogValue';

export {
    LogCategory, LogEntry, LogKey, LogTag, LogValue,
};

const Mapping = {
    'log-category': LogCategory,
    'log-entry': LogEntry,
    'log-key': LogKey,
    'log-tag': LogTag,
    'log-value': LogValue,
};

export function getDataTypeMapping() {
    return Mapping;
}
