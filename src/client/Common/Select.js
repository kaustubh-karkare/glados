import Form from 'react-bootstrap/Form';
import React from 'react';
import PropTypes from 'prop-types';

function Select(props) {
    return (
        <Form.Control
            as="select"
            value={props.value}
            onChange={(event) => props.onChange(event.target.value)}
        >
            {props.options.map((item) => {
                const optionProps = { key: item.value, value: item.value };
                return <option {...optionProps}>{item.label}</option>;
            })}
        </Form.Control>
    );
}

Select.propTypes = {
    value: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
    ).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default Select;
