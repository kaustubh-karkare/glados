import React from 'react';
import { LogEntry } from '../../data';
import PropTypes from '../prop-types';
import { TextEditor } from '../Common';

const TextEditorSources = [
    { trigger: '@', dataType: 'log-tag' },
    { trigger: '#', dataType: 'log-tag' },
];

const AugmentedTextEditorSources = [
    ...TextEditorSources,
    { trigger: '!', dataType: 'log-entry' },
];

function LogEntryTitleEditor(props) {
    const {
        logEntry, onUpdate, onMajorUpdate, ...moreProps
    } = props;
    return (
        <TextEditor
            isSingleLine
            focusOnLoad
            value={logEntry.title}
            sources={AugmentedTextEditorSources}
            disabled={!!logEntry.logStructure.titleTemplate}
            onUpdate={(value) => {
                const updatedLogEntry = { ...logEntry };
                updatedLogEntry.title = value;
                LogEntry.trigger(updatedLogEntry);
                onUpdate(updatedLogEntry);
            }}
            onSelectSuggestion={(option) => {
                if (option.__type__ === 'log-entry') {
                    const updatedLogEntry = option;
                    updatedLogEntry.id = logEntry.id;
                    LogEntry.trigger(updatedLogEntry);
                    (onMajorUpdate || onUpdate)(updatedLogEntry);
                } else if (option.__type__ === 'log-structure') {
                    const logStructure = option;
                    const selector = props.selector || {};
                    const updatedLogEntry = LogEntry.createVirtual({ ...selector, logStructure });
                    LogEntry.trigger(updatedLogEntry);
                    (onMajorUpdate || onUpdate)(updatedLogEntry);
                }
            }}
            {...moreProps}
        />
    );
}

LogEntryTitleEditor.propTypes = {
    logEntry: PropTypes.Custom.LogEntry.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
    onUpdate: PropTypes.func.isRequired,
    onMajorUpdate: PropTypes.func,
};

export { TextEditorSources };
export default LogEntryTitleEditor;
