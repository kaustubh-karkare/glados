import LogStructure from './LogStructure';
import LogEvent from './LogEvent';
import LogReminder from './LogReminder';
import LogReminderGroup from './LogReminderGroup';
import LogTopic from './LogTopic';

export {
    LogTopic,
    LogStructure,
    LogReminderGroup,
    LogReminder,
    LogEvent,
};

const Mapping = {
    'log-topic': LogTopic,
    'log-structure': LogStructure,
    'log-reminder': LogReminder,
    'log-reminder-group': LogReminderGroup,
    'log-event': LogEvent,
};

export function getDataTypeMapping() {
    return Mapping;
}
