import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, Select, Typeahead } from '../Common';
import LogReminderGroup from '../../data/LogReminderGroup';
import LogReminderList from './LogReminderList';


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
        <LogReminderList
            name="Reminders"
            selector={{ group_id: logReminderGroup.id }}
            creator={{ logReminderGroup }}
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
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Sidebar
                </InputGroup.Text>
                <Select.Binary
                    value={logReminderGroup.onSidebar}
                    options={LogReminderGroup.getTypeOptions()}
                    onChange={(onSidebar) => props.onChange({ ...logReminderGroup, onSidebar })}
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
            allowReordering
        />
    );
}

export default LogReminderGroupList;
