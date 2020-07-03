import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { TextInput } from '../Common';

function LogValueEditor(props) {
    const { logValue } = props;
    return (
        <InputGroup className="my-1">
            <InputGroup.Text>
                {logValue.logKey.name}
            </InputGroup.Text>
            <TextInput
                value={logValue.data}
                disabled={props.disabled}
                onChange={(newData) => props.onChange({
                    ...logValue,
                    data: newData,
                })}
            />
        </InputGroup>
    );
}

LogValueEditor.propTypes = {
    logValue: PropTypes.Custom.LogValue.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogValueEditor;
