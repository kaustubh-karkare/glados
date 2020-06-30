import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';
import LogReminderEditor from './LogReminderEditor';


function ViewerComponent(props) {
    const logReminder = props.value;
    return (
        <TextEditor
            unstyled
            disabled
            // sources={TextEditorSources}
            value={logReminder.title}
        />
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogReminder.isRequired,
};

function EditorComponent(props) {
    const logReminder = props.value;
    return (
        <LogReminderEditor
            logReminder={logReminder}
            onChange={props.onChange}
            onSpecialKeys={props.onSpecialKeys}
        />
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogReminder.isRequired,
    onChange: PropTypes.func.isRequired,
    onSpecialKeys: PropTypes.func.isRequired,
};

function LogReminderList(props) {
    return (
        <BulletList
            name="Reminders"
            dataType="log-reminder"
            selector={props.selector}
            ViewerComponent={ViewerComponent}
            EditorComponent={EditorComponent}
        />
    );
}

LogReminderList.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object.isRequired,
};

LogReminderList.ViewerComponent = ViewerComponent;
LogReminderList.EditorComponent = EditorComponent;
export default LogReminderList;
