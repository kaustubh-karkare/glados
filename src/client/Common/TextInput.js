import Form from 'react-bootstrap/Form';
import React from 'react';
import PropTypes from '../prop-types';

function TextInput(props) {
    return (
        <Form.Control
            value={props.value}
            disabled={props.disabled}
            onChange={(event) => props.onChange(event.target.value)}
        />
    );
}

TextInput.propTypes = {
    value: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TextInput;
