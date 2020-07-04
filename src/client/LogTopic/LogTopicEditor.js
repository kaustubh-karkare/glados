import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import {
    AsyncSelector, Selector, TextInput,
} from '../Common';

function LogTopicEditor(props) {
    const { logTopic } = props;
    return (
        <div>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Group
                </InputGroup.Text>
                <AsyncSelector
                    dataType="log-topic-group"
                    value={logTopic.logTopicGroup}
                    disabled={props.disabled}
                    onChange={(newLogTopicGroup) => props.onChange({
                        ...logTopic,
                        logTopicGroup: newLogTopicGroup,
                    })}
                />
            </InputGroup>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Name
                </InputGroup.Text>
                <TextInput
                    allowUpdate
                    dataType="log-topic"
                    value={logTopic.name}
                    disabled={props.disabled}
                    onChange={(newName) => props.onChange({
                        ...logTopic,
                        name: newName,
                    })}
                />
            </InputGroup>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Sidebar
                </InputGroup.Text>
                <Selector.Binary
                    value={logTopic.onSidebar}
                    disabled={props.disabled}
                    onChange={(onSidebar) => props.onChange({ ...logTopic, onSidebar })}
                />
            </InputGroup>
        </div>
    );
}

LogTopicEditor.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogTopicEditor;
