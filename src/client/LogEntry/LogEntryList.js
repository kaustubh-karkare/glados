import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';

import { LogEntry } from '../../data';
import LogEntryAdder from './LogEntryAdder';
import LogEntryEditor from './LogEntryEditor';


function ViewerComponent(props) {
    const logEntry = props.value;
    if (!props.isExpanded) {
        return (
            <TextEditor
                unstyled
                disabled
                value={logEntry.title}
            />
        );
    }
    if (!logEntry.details) {
        return null;
    }
    return (
        <TextEditor
            unstyled
            disabled
            value={logEntry.details}
        />
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogEntry.isRequired,
    isExpanded: PropTypes.bool.isRequired,
};

function EditorComponent(props) {
    return (
        <LogEntryEditor
            logEntry={props.value}
            onUpdate={(logEntry) => {
                LogEntry.trigger(logEntry);
                props.onChange(logEntry);
            }}
        />
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogEntry.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogEntryList() {
    return (
        <BulletList
            name="2020-06-21 (Sunday)"
            dataType="log-entry"
            EditorComponent={EditorComponent}
            ViewerComponent={ViewerComponent}
            AdderComponent={LogEntryAdder}
        />
    );
}

export default LogEntryList;
