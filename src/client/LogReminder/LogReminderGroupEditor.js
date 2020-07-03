import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { Select, Typeahead } from '../Common';
import LogReminderGroup from '../../data/LogReminderGroup';
import PropTypes from '../prop-types';

function LogReminderGroupEditor(props) {
    const { logReminderGroup } = props;
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

LogReminderGroupEditor.propTypes = {
    logReminderGroup: PropTypes.Custom.LogReminderGroup.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogReminderGroupEditor;
