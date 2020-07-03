import React from 'react';
import { BulletList } from '../Common';
import LogTopicGroupEditor from './LogTopicGroupEditor';
import LogTopicList from './LogTopicList';
import PropTypes from '../prop-types';


function ViewerComponent(props) {
    const { logTopicGroup } = props;
    return (
        <div className="log-viewer">
            {logTopicGroup.name}
        </div>
    );
}

ViewerComponent.propTypes = {
    logTopicGroup: PropTypes.Custom.LogTopicGroup.isRequired,
};

ViewerComponent.Expanded = (props) => {
    const { logTopicGroup } = props;
    return (
        <LogTopicList
            name="Topics"
            selector={{ group_id: logTopicGroup.id }}
            creator={{ logTopicGroup }}
        />
    );
};

ViewerComponent.Expanded.propTypes = {
    logTopicGroup: PropTypes.Custom.LogTopicGroup.isRequired,
};

function LogTopicGroupList() {
    return (
        <BulletList
            name="Topic Groups"
            dataType="log-topic-group"
            valueKey="logTopicGroup"
            ViewerComponent={ViewerComponent}
            EditorComponent={LogTopicGroupEditor}
            allowReordering
        />
    );
}

export default LogTopicGroupList;
