import LogStructure from './LogStructure';
import LogEntry from './LogEntry';
import LogReminder from './LogReminder';
import LogReminderGroup from './LogReminderGroup';
import LogTopic from './LogTopic';
import LogTopicGroup from './LogTopicGroup';

export {
    LogTopicGroup,
    LogTopic,
    LogStructure,
    LogReminderGroup,
    LogReminder,
    LogEntry,
};

const Mapping = {
    'log-topic-group': LogTopicGroup,
    'log-topic': LogTopic,
    'log-structure': LogStructure,
    'log-reminder': LogReminder,
    'log-reminder-group': LogReminderGroup,
    'log-entry': LogEntry,
};

export function getDataTypeMapping() {
    return Mapping;
}
