import React from 'react';
import PropTypes from '../prop-types';
import { BulletList } from '../Common';
import LogReminderGroupEditor from './LogReminderGroupEditor';
import LogReminderList from './LogReminderList';


function ViewerComponent(props) {
    const { logReminderGroup } = props;
    return (
        <div className="log-viewer">
            {logReminderGroup.name}
            <span className="log-viewer">
                {` (${logReminderGroup.type})`}
            </span>
        </div>
    );
}

ViewerComponent.propTypes = {
    logReminderGroup: PropTypes.Custom.LogReminderGroup.isRequired,
};

ViewerComponent.Expanded = (props) => {
    const { logReminderGroup } = props;
    return (
        <LogReminderList
            name="Reminders"
            selector={{ group_id: logReminderGroup.id }}
            creator={{ logReminderGroup }}
        />
    );
};

ViewerComponent.Expanded.propTypes = {
    logReminderGroup: PropTypes.Custom.LogReminderGroup.isRequired,
};

function LogReminderGroupList() {
    return (
        <BulletList
            name="Reminder Groups"
            dataType="log-reminder-group"
            valueKey="logReminderGroup"
            ViewerComponent={ViewerComponent}
            EditorComponent={LogReminderGroupEditor}
            allowReordering
        />
    );
}

export default LogReminderGroupList;
