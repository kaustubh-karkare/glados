import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, Typeahead } from '../Common';


function ViewerComponent(props) {
    const logReminderGroup = props.value;
    return (
        <div className="log-viewer">
            {logReminderGroup.name}
        </div>
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogReminderGroup.isRequired,
    // isExpanded: PropTypes.bool.isRequired,
};

function EditorComponent(props) {
    const logReminderGroup = props.value;
    return (
        <InputGroup className="my-1">
            <Typeahead
                allowUpdate
                dataType="log-reminder-group"
                value={logReminderGroup}
                onUpdate={props.onChange}
            />
        </InputGroup>
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogReminderGroup.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogReminderGroupList() {
    return (
        <BulletList
            name="Reminder Groups"
            dataType="log-reminder-group"
            EditorComponent={EditorComponent}
            ViewerComponent={ViewerComponent}
        />
    );
}

export default LogReminderGroupList;
