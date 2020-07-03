import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { Dropdown, TextInput } from '../Common';
import { LogStructure } from '../../data';
import PropTypes from '../prop-types';

function LogKeyEditor(props) {
    const { logKey } = props;
    return (
        <InputGroup className="my-1">
            <Dropdown
                value={logKey.type}
                options={LogStructure.KeyOptions}
                disabled={props.disabled}
                onChange={(type) => props.onChange({ ...logKey, type })}
            />
            <TextInput
                value={logKey.name}
                disabled={props.disabled}
                onChange={(newName) => props.onChange({ ...logKey, name: newName })}
            />
        </InputGroup>
    );
}

LogKeyEditor.propTypes = {
    logKey: PropTypes.Custom.LogStructureKey.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogKeyEditor;
