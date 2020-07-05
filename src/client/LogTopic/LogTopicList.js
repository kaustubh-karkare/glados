import React from 'react';
import PropTypes from '../prop-types';
import { BulletList } from '../Common';
import LogTopicEditor from './LogTopicEditor';


function LogTopicViewer(props) {
    const { logTopic } = props;
    return (
        <a
            key={logTopic.id}
            href="#"
            onClick={() => window.logTopic_select(logTopic)}
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

LogTopicList.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
};

LogTopicList.defaultProps = {
    selector: { parent_id: null },
};

LogTopicViewer.Expanded = (props) => {
    const { logTopic } = props;
    return (
        <LogTopicList
            name="Sub Topics"
            selector={{ parent_id: logTopic.id }}
            creator={{ parentLogTopic: logTopic }}
        />
    );
};

LogTopicViewer.Expanded.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
};

export default LogTopicList;
