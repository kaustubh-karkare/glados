import React from 'react';
import PropTypes from '../prop-types';
import { BulletList } from '../Common';
import LogTopicEditor from './LogTopicEditor';


function LogTopicViewer(props) {
    const { logTopic } = props;
    return (
        <div className="log-viewer">
            {logTopic.name}
        </div>
    );
}

LogTopicViewer.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
};

function LogTopicList(props) {
    return (
        <BulletList
            {...props}
            name="Topics"
            dataType="log-topic"
            valueKey="logTopic"
            ViewerComponent={LogTopicViewer}
            EditorComponent={LogTopicEditor}
            allowReordering
        />
    );
}

export default LogTopicList;
