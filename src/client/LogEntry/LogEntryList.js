import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';

import { LogEntry } from '../../data';
import LogEntryAdder from './LogEntryAdder';
import LogEntryEditor from './LogEntryEditor';


function ViewerComponent(props) {
    const logEntry = props.value;
    return (
        <TextEditor
            unstyled
            disabled
            value={logEntry.title}
        />
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogEntry.isRequired,
};

function ExpandedViewerComponent(props) {
    const logEntry = props.value;
    return (
        <TextEditor
            unstyled
            disabled
            value={logEntry.details}
        />
    );
}

ExpandedViewerComponent.propTypes = {
    value: PropTypes.Custom.LogEntry.isRequired,
};

function EditorComponent(props) {
    return (
        <LogEntryEditor
            logEntry={props.value}
            onUpdate={(logEntry) => {
                LogEntry.trigger(logEntry);
                props.onChange(logEntry);
            }}
            onSpecialKeys={props.onSpecialKeys}
            hideReminderSection={props.hideReminderSection}
        />
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogEntry.isRequired,
    onChange: PropTypes.func.isRequired,
    onSpecialKeys: PropTypes.func.isRequired,
    hideReminderSection: PropTypes.bool,
};

function LogEntryList(props) {
    return (
        <BulletList
            name={props.name}
            dataType="log-entry"
            selector={props.selector}
            allowReordering
            allowSubscription
            ViewerComponent={ViewerComponent}
            ExpandedViewerComponent={ExpandedViewerComponent}
            EditorComponent={EditorComponent}
            AdderComponent={props.showAdder ? LogEntryAdder : null}
        />
    );
}

LogEntryList.propTypes = {
    name: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object.isRequired,
    showAdder: PropTypes.bool.isRequired,
};

LogEntryList.ViewerComponent = ViewerComponent;
LogEntryList.EditorComponent = EditorComponent;

export default LogEntryList;
