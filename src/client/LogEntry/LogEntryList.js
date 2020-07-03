import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';

import LogEntryAdder from './LogEntryAdder';
import LogEntryEditor from './LogEntryEditor';


function ViewerComponent(props) {
    return (
        <TextEditor
            unstyled
            disabled
            value={props.logEntry.title}
        />
    );
}

ViewerComponent.propTypes = {
    logEntry: PropTypes.Custom.LogEntry.isRequired,
};

ViewerComponent.Expanded = (props) => {
    const { logEntry } = props;
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
};

ViewerComponent.Expanded.propTypes = {
    logEntry: PropTypes.Custom.LogEntry.isRequired,
};

function LogEntryList(props) {
    return (
        <BulletList
            name={props.name}
            dataType="log-entry"
            valueKey="logEntry"
            selector={props.selector}
            allowReordering
            allowSubscription
            ViewerComponent={ViewerComponent}
            EditorComponent={LogEntryEditor}
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

export default LogEntryList;
