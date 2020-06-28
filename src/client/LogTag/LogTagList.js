import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, Dropdown, Typeahead } from '../Common';
import { LogTag } from '../../data';


function ViewerComponent(props) {
    const logTag = props.value;
    return (
        <div className="log-viewer">
            <span>{`(${logTag.type}) `}</span>
            {logTag.name}
        </div>
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogTag.isRequired,
    // isExpanded: PropTypes.bool.isRequired,
};

function EditorComponent(props) {
    const logTag = props.value;
    return (
        <InputGroup>
            <Dropdown
                value={logTag.type}
                options={LogTag.getTypes()}
                onUpdate={(type) => props.onChange({ ...logTag, type })}
            />
            <Typeahead
                allowUpdate
                dataType="log-tag"
                value={logTag}
                onUpdate={props.onChange}
            />
        </InputGroup>
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogTag.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogTagList() {
    return (
        <BulletList
            name="Tags"
            dataType="log-tag"
            ViewerComponent={ViewerComponent}
            EditorComponent={EditorComponent}
        />
    );
}

export default LogTagList;
