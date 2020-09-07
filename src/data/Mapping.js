import LogMode from './LogMode';
import LogTopic from './LogTopic';
import LogStructure from './LogStructure';
import LogStructureGroup from './LogStructureGroup';
import LogEvent from './LogEvent';

export {
    LogMode,
    LogTopic,
    LogStructureGroup,
    LogStructure,
    LogEvent,
};

const Mapping = {
    'log-mode': LogMode,
    'log-topic': LogTopic,
    'log-structure-group': LogStructureGroup,
    'log-structure': LogStructure,
    'log-event': LogEvent,
};

export function getDataTypeMapping() {
    return Mapping;
}
