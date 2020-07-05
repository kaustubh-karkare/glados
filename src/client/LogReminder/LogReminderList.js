import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';
import LogReminderEditor from './LogReminderEditor';


function ViewerComponent(props) {
    return (
        <>
            <TextEditor
                unstyled
                disabled
                value={props.logReminder.title}
            />
            {props.logReminder.isMajor ? '(major)' : null}
        </>
    );
}

ViewerComponent.propTypes = {
    logReminder: PropTypes.Custom.LogReminder.isRequired,
};

function LogReminderList(props) {
    return (
        <BulletList
            {...props}
            dataType="log-reminder"
            valueKey="logReminder"
            ViewerComponent={ViewerComponent}
            EditorComponent={LogReminderEditor}
            allowReordering
        />
    );
}

export default LogReminderList;
