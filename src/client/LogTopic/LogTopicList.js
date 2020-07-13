import React from 'react';
import PropTypes from '../prop-types';
import { BulletList } from '../Common';
import LogTopicEditor from './LogTopicEditor';
import LogReminderList from '../LogReminder/LogReminderList';

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
    if (logTopic.isPeriodicReminder) {
        return null;
    }
    return (
        <>
            <LogTopicList
                name="Sub Topics"
                selector={{ parent_topic_id: logTopic.id }}
                creator={{ parentLogTopic: logTopic }}
            />
            <LogReminderList
                name="Reminders"
                selector={{ parent_topic_id: logTopic.id }}
                creator={{ parentLogTopic: logTopic }}
            />
        </>
    );
};

LogTopicViewer.Expanded.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
};

export default LogTopicList;
