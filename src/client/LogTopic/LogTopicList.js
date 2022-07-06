import PropTypes from 'prop-types';
import React from 'react';

import {
    BulletList, DetailsIcon, Link, WarningIcon,
} from '../Common';
import LogTopicEditor from './LogTopicEditor';

function LogTopicViewer(props) {
    const { logTopic } = props;
    let childIndicator = null;
    if (logTopic.childCount) {
        childIndicator = (
            <span className="ml-1" style={{ color: 'var(--link-color)' }}>
                {logTopic.childCount}
            </span>
        );
    }
    return (
        <span>
            <Link logTopic={logTopic}>
                {logTopic.name}
            </Link>
            <DetailsIcon isShown={!!logTopic.details} />
            {childIndicator}
            <WarningIcon isShown={logTopic.isDeprecated} />
        </span>
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
            allowSorting
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
            where={{ parentLogTopic: logTopic }}
        />
    );
};

LogTopicViewer.Expanded.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
};

LogTopicList.Single = (props) => (
    <BulletList.Item
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
