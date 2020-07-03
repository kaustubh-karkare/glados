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

function LogTopicList(props) {
    return (
        <BulletList
            {...props}
            name="Topics"
            dataType="log-topic"
            valueKey="logTopic"
            ViewerComponent={ViewerComponent}
            EditorComponent={LogTopicEditor}
            allowReordering
        />
    );
}

export default LogTopicList;
