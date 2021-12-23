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
        const {
            value, disabled, onChange, ...moreProps
        } = this.props;
        return (
            <Form.Control
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                ref={this.ref}
                {...moreProps}
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
