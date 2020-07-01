import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { BulletList, Typeahead } from '../Common';
import LogTopicList from './LogTopicList';
import PropTypes from '../prop-types';


function ViewerComponent(props) {
    const logTopicGroup = props.value;
    return (
        <div className="log-viewer">
            {logTopicGroup.name}
        </div>
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogTopicGroup.isRequired,
};

function ExpandedViewerComponent(props) {
    const logTopicGroup = props.value;
    return (
        <LogTopicList
            name="Topics"
            selector={{ group_id: logTopicGroup.id }}
            creator={{ logTopicGroup }}
        />
    );
}

ExpandedViewerComponent.propTypes = {
    value: PropTypes.Custom.LogTopicGroup.isRequired,
};

function EditorComponent(props) {
    const logTopicGroup = props.value;
    return (
        <InputGroup>
            <InputGroup.Text>
                Name
            </InputGroup.Text>
            <Typeahead
                allowUpdate
                dataType="log-topic-group"
                value={logTopicGroup}
                onUpdate={props.onChange}
            />
        </InputGroup>
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogTopicGroup.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogTopicGroupList() {
    return (
        <BulletList
            name="Topic Groups"
            dataType="log-topic-group"
            ViewerComponent={ViewerComponent}
            ExpandedViewerComponent={ExpandedViewerComponent}
            EditorComponent={EditorComponent}
            allowReordering
        />
    );
}

export default LogTopicGroupList;
