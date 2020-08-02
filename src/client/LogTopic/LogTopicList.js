import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, Coordinator } from '../Common';
import LogTopicEditor from './LogTopicEditor';

function LogTopicViewer(props) {
    const { logTopic } = props;
    return (
        <a
            className="topic"
            key={logTopic.id}
            href="#"
            onClick={() => Coordinator.invoke('details', logTopic)}
            tabIndex={-1}
        >
            {logTopic.name}
        </a>
    );
}

LogTopicViewer.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
};

function LogTopicList(props) {
    return (
        <BulletList
            name="Topics"
            dataType="log-topic"
            valueKey="logTopic"
            ViewerComponent={LogTopicViewer}
            EditorComponent={LogTopicEditor}
            allowReordering
            {...props}
        />
    );
}

LogTopicViewer.Expanded = (props) => {
    const { logTopic } = props;
    if (logTopic.hasStructure) {
        return null;
    }
    return (
        <LogTopicList
            name="Sub Topics"
            where={{ parent_topic_id: logTopic.id }}
            creator={{ parentLogTopic: logTopic }}
        />
    );
};

LogTopicViewer.Expanded.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
};

LogTopicList.Single = (props) => (
    <BulletList.Item
        key={props.logTopic.id}
        dataType="log-topic"
        value={props.logTopic}
        valueKey="logTopic"
        ViewerComponent={LogTopicViewer}
        EditorComponent={LogTopicEditor}
    />
);

LogTopicList.Single.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
};

export default LogTopicList;
