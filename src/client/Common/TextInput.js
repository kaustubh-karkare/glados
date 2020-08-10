import Form from 'react-bootstrap/Form';
import React from 'react';
import PropTypes from 'prop-types';

class TextInput extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    focus() {
        this.ref.current.focus();
    }

    render() {
        return (
            <Form.Control
                value={this.props.value}
                disabled={this.props.disabled}
                onChange={(event) => this.props.onChange(event.target.value)}
                ref={this.ref}
            />
        );
    }
}

TextInput.propTypes = {
    value: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TextInput;
