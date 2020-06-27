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
        <InputGroup className="my-1">
            <Dropdown
                value={logKey.type}
                options={LogKey.getTypes()}
                onUpdate={(type) => props.onChange({ ...logKey, type })}
            />
            <Typeahead
                allowUpdate
                dataType="log-key"
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

export { EditorComponent as LogKeyEditor };
export default LogKeyList;
