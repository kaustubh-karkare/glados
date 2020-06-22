import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, Dropdown, Typeahead } from '../Common';
import { LogKey } from '../../data';


function ViewerComponent(props) {
    const logKey = props.value;
    return (
        <div className="log-viewer">
            {logKey.name}
            <span>{` (${logKey.type})`}</span>
        </div>
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogKey.isRequired,
    // isExpanded: PropTypes.bool.isRequired,
};

function EditorComponent(props) {
    const logKey = props.value;
    return (
        <InputGroup>
            <Dropdown
                value={logKey.type}
                options={LogKey.getTypes()}
                onUpdate={(type) => props.onChange({ ...logKey, type })}
            />
            <Typeahead
                allowUpdate
                dataType="log-tag"
                value={logKey}
                onUpdate={props.onChange}
            />
        </InputGroup>
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogKey.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogKeyList() {
    return (
        <BulletList
            name="Keys"
            dataType="log-key"
            EditorComponent={EditorComponent}
            ViewerComponent={ViewerComponent}
        />
    );
}

export default LogKeyList;
