import React from 'react';
import PropTypes from '../prop-types';
import { BulletList } from '../Common';
import LogTopicEditor from './LogTopicEditor';


function ViewerComponent(props) {
    const logTopic = props.value;
    return (
        <div className="log-viewer">
            {logTopic.name}
        </div>
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogTopic.isRequired,
};

function EditorComponent(props) {
    return (
        <LogTopicEditor
            logTopic={props.value}
            onChange={props.onChange}
        />
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogTopic.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogTopicList(props) {
    return (
        <BulletList
            {...props}
            name="Topics"
            dataType="log-topic"
            ViewerComponent={ViewerComponent}
            EditorComponent={EditorComponent}
            allowReordering
        />
    );
}

export default LogTopicList;
