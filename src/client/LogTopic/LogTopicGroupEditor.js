import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { TextInput } from '../Common';
import PropTypes from '../prop-types';

function LogTopicGroupEditor(props) {
    const { logTopicGroup } = props;
    return (
        <InputGroup>
            <InputGroup.Text>
                Name
            </InputGroup.Text>
            <TextInput
                value={logTopicGroup.name}
                disabled={props.disabled}
                onChange={(newName) => props.onChange({
                    ...logTopicGroup,
                    name: newName,
                })}
            />
        </InputGroup>
    );
}

LogTopicGroupEditor.propTypes = {
    logTopicGroup: PropTypes.Custom.LogTopicGroup.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogTopicGroupEditor;
