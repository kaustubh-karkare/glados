import Form from 'react-bootstrap/Form';
import React from 'react';
import PropTypes from '../prop-types';

function TextInput(props) {
    return (
        <Form.Control
            value={props.value}
            onChange={(event) => props.onChange(event.target.value)}
        />
    );
}

TextInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TextInput;
