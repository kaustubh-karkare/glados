import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, Typeahead } from '../Common';


function ViewerComponent(props) {
    const logTopic = props.value;
    return (
        <div className="log-viewer">
            <span>{`(${logTopic.type}) `}</span>
            {logTopic.name}
        </div>
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogTopic.isRequired,
    // isExpanded: PropTypes.bool.isRequired,
};

function EditorComponent(props) {
    const logTopic = props.value;
    return (
        <InputGroup>
            <InputGroup.Text>
                Name
            </InputGroup.Text>
            <Typeahead
                allowUpdate
                dataType="log-topic"
                value={logTopic}
                onUpdate={props.onChange}
            />
        </InputGroup>
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogTopic.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogTopicList() {
    return (
        <BulletList
            name="Topics"
            dataType="log-topic"
            ViewerComponent={ViewerComponent}
            EditorComponent={EditorComponent}
        />
    );
}

export default LogTopicList;
