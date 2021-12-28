import LogTopic from './log_topic';
import LogStructure from './log_structure';
import LogStructureGroup from './log_structure_group';
import LogEvent from './log_event';

export {
    LogTopic,
    LogStructureGroup,
    LogStructure,
    LogEvent,
};

const Mapping = {
    'log-topic': LogTopic,
    'log-structure-group': LogStructureGroup,
    'log-structure': LogStructure,
    'log-event': LogEvent,
};

export function getDataTypeMapping() {
    return Mapping;
}

export { default as Enum } from './enum';
export * from './utils';
