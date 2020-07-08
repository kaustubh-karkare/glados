import LogStructure from './LogStructure';
import LogEvent from './LogEvent';
import LogReminder from './LogReminder';
import LogTopic from './LogTopic';

export {
    LogTopic,
    LogStructure,
    LogReminder,
    LogEvent,
};

const Mapping = {
    'log-topic': LogTopic,
    'log-structure': LogStructure,
    'log-reminder': LogReminder,
    'log-event': LogEvent,
};

export function getDataTypeMapping() {
    return Mapping;
}
