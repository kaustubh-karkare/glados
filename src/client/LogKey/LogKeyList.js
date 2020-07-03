import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, Dropdown, Typeahead } from '../Common';
import { LogKey } from '../../data';


function ViewerComponent(props) {
    const { logKey } = props;
    return (
        <div className="log-viewer">
            {logKey.name}
            <span>{` (${logKey.type})`}</span>
        </div>
    );
}

ViewerComponent.propTypes = {
    logKey: PropTypes.Custom.LogKey.isRequired,
};

function EditorComponent(props) {
    const { logKey } = props;
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
    logKey: PropTypes.Custom.LogKey.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogKeyList() {
    return (
        <BulletList
            name="Keys"
            dataType="log-key"
            valueKey="logKey"
            ViewerComponent={ViewerComponent}
            EditorComponent={EditorComponent}
        />
    );
}

export { EditorComponent as LogKeyEditor };
export default LogKeyList;
