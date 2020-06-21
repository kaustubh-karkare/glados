import LogCategory from './LogCategory';
import LogEntry from './LogEntry';
import LogKey from './LogKey';
import LogTag from './LogTag';
import LogValue from './LogValue';
import Utils from './Utils';

const { getNegativeID } = Utils;

const Mapping = {
    'log-category': LogCategory,
    'log-entry': LogEntry,
    'log-key': LogKey,
    'log-tag': LogTag,
    'log-value': LogValue,
};

function getDataTypeMapping() {
    return Mapping;
}

export {
    LogCategory, LogEntry, LogKey, LogTag, LogValue,
    getNegativeID, getDataTypeMapping,
};
