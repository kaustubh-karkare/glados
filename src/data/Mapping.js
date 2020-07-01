import LogStructure from './LogStructure';
import LogEntry from './LogEntry';
import LogKey from './LogKey';
import LogReminder from './LogReminder';
import LogReminderGroup from './LogReminderGroup';
import LogTopic from './LogTopic';
import LogTopicGroup from './LogTopicGroup';
import LogValue from './LogValue';

export {
    LogTopicGroup,
    LogTopic,
    LogStructure,
    LogKey,
    LogValue,
    LogReminderGroup,
    LogReminder,
    LogEntry,
};

const Mapping = {
    'log-topic-group': LogTopicGroup,
    'log-topic': LogTopic,
    'log-structure': LogStructure,
    'log-key': LogKey,
    'log-value': LogValue,
    'log-reminder': LogReminder,
    'log-reminder-group': LogReminderGroup,
    'log-entry': LogEntry,
};

export function getDataTypeMapping() {
    return Mapping;
}
