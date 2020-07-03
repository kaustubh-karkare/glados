import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { BulletList, TextInput } from '../Common';
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

function EditorComponent(props) {
    const { logTopicGroup } = props;
    return (
        <InputGroup>
            <InputGroup.Text>
                Name
            </InputGroup.Text>
            <TextInput
                value={logTopicGroup.name}
                onChange={(newName) => props.onChange({
                    ...logTopicGroup,
                    name: newName,
                })}
            />
        </InputGroup>
    );
}

EditorComponent.propTypes = {
    logTopicGroup: PropTypes.Custom.LogTopicGroup.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogTopicGroupList() {
    return (
        <BulletList
            name="Topic Groups"
            dataType="log-topic-group"
            valueKey="logTopicGroup"
            ViewerComponent={ViewerComponent}
            EditorComponent={EditorComponent}
            allowReordering
        />
    );
}

export default LogTopicGroupList;
