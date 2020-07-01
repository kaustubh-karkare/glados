import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { Typeahead, TextEditor } from '../Common';
import { LogTopicGroup } from '../../data';

function LogTopicEditor(props) {
    return (
        <div>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Group
                </InputGroup.Text>
                <Typeahead
                    dataType="log-topic-group"
                    value={props.logTopic.logTopicGroup}
                    onUpdate={(newLogTopicGroup) => props.onChange({
                        ...props.logTopic,
                        logTopicGroup: newLogTopicGroup,
                    })}
                    allowDelete
                    onDelete={(newLogTopicGroup) => props.onChange({
                        ...props.logTopic,
                        logTopicGroup: LogTopicGroup.createVirtual(),
                    })}
                />
            </InputGroup>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Name
                </InputGroup.Text>
                <Typeahead
                    allowUpdate
                    dataType="log-topic"
                    value={props.logTopic}
                    onUpdate={props.onChange}
                />
            </InputGroup>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Details
                </InputGroup.Text>
                <TextEditor
                    value={props.logTopic.details}
                    onUpdate={(newDetails) => props.onChange({
                        ...props.logTopic,
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
