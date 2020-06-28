import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, Select, Typeahead } from '../Common';
import LogReminderGroup from '../../data/LogReminderGroup';
import { LogEntryList } from '../LogEntry';


function ViewerComponent(props) {
    const logReminderGroup = props.value;
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
    value: PropTypes.Custom.LogReminderGroup.isRequired,
};

function ExpandedViewerComponent(props) {
    const logReminderGroup = props.value;
    return (
        <LogEntryList
            name="Reminder Entries"
            selector={{ logReminder: { logReminderGroup } }}
            showAdder
        />
    );
}

ExpandedViewerComponent.propTypes = {
    value: PropTypes.Custom.LogReminderGroup.isRequired,
};

function EditorComponent(props) {
    const logReminderGroup = props.value;
    return (
        <>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Name
                </InputGroup.Text>
                <Typeahead
                    allowUpdate
                    dataType="log-reminder-group"
                    value={logReminderGroup}
                    onUpdate={props.onChange}
                />
            </InputGroup>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Type
                </InputGroup.Text>
                <Select
                    value={logReminderGroup.type}
                    options={LogReminderGroup.getTypeOptions()}
                    onChange={(newType) => props.onChange({
                        ...logReminderGroup,
                        type: newType,
                    })}
                />
            </InputGroup>
        </>
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
            ViewerComponent={ViewerComponent}
            ExpandedViewerComponent={ExpandedViewerComponent}
            EditorComponent={EditorComponent}
        />
    );
}

export default LogReminderGroupList;
