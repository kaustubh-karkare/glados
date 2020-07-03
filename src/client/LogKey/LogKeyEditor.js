import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { Dropdown } from '../Common';
import { LogKey } from '../../data';
import PropTypes from '../prop-types';

function LogKeyEditor(props) {
    const { logKey } = props;
    return (
        <InputGroup className="my-1">
            <Dropdown
                value={logKey.type}
                options={LogKey.Options}
                onUpdate={(type) => props.onChange({ ...logKey, type })}
            />
            <Form.Control
                value={logKey.name}
                onChange={(event) => props.onChange({ ...logKey, name: event.target.value })}
            />
        </InputGroup>
    );
}

LogKeyEditor.propTypes = {
    logKey: PropTypes.Custom.LogKey.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogKeyEditor;
