import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { AsyncSelector, TextEditor, TextInput } from '../Common';

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
                    onChange={(newName) => props.onChange({
                        ...logTopic,
                        name: newName,
                    })}
                />
            </InputGroup>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Details
                </InputGroup.Text>
                <TextEditor
                    value={logTopic.details}
                    onUpdate={(newDetails) => props.onChange({
                        ...logTopic,
                        details: newDetails,
                    })}
                    serverSideTypes={['log-topic']}
                />
            </InputGroup>
        </div>
    );
}

LogTopicEditor.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogTopicEditor;
