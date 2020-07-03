import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { Selector, TextInput } from '../Common';
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
                <TextInput
                    value={logReminderGroup.name}
                    disabled={props.disabled}
                    onChange={(newName) => props.onChange({
                        ...logReminderGroup,
                        name: newName,
                    })}
                />
            </InputGroup>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Type
                </InputGroup.Text>
                <Selector
                    value={logReminderGroup.type}
                    options={LogReminderGroup.getTypeOptions()}
                    disabled={props.disabled}
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
                <Selector.Binary
                    value={logReminderGroup.onSidebar}
                    options={LogReminderGroup.getTypeOptions()}
                    disabled={props.disabled}
                    onChange={(onSidebar) => props.onChange({ ...logReminderGroup, onSidebar })}
                />
            </InputGroup>
        </>
    );
}

LogReminderGroupEditor.propTypes = {
    logReminderGroup: PropTypes.Custom.LogReminderGroup.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogReminderGroupEditor;
