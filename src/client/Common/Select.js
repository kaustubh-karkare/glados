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

function BinarySelect(props) {
    const options = [
        { label: props.noLabel, value: 'no' },
        { label: props.yesLabel, value: 'yes' },
    ];
    return (
        <Select
            value={options[props.value ? 1 : 0].value}
            options={options}
            onChange={(newValue) => props.onChange(newValue === options[1].value)}
        />
    );
}

BinarySelect.propTypes = {
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    noLabel: PropTypes.string,
    yesLabel: PropTypes.string,
};

BinarySelect.defaultProps = {
    noLabel: 'No',
    yesLabel: 'Yes',
};

Select.Binary = BinarySelect;

export default Select;
