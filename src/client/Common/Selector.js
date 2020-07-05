import Form from 'react-bootstrap/Form';
import React from 'react';
import PropTypes from 'prop-types';

function Selector(props) {
    return (
        <Form.Control
            as="select"
            value={props.value}
            disabled={props.disabled}
            onChange={(event) => props.onChange(event.target.value)}
            size="sm"
        >
            {props.options.map((item) => {
                const optionProps = { key: item.value, value: item.value };
                return <option {...optionProps}>{item.label}</option>;
            })}
        </Form.Control>
    );
}

Selector.propTypes = {
    value: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
    ).isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

function BinarySelector(props) {
    const options = [
        { label: props.noLabel, value: 'no' },
        { label: props.yesLabel, value: 'yes' },
    ];
    return (
        <Selector
            {...props}
            value={options[props.value ? 1 : 0].value}
            options={options}
            onChange={(newValue) => props.onChange(newValue === options[1].value)}
        />
    );
}

BinarySelector.propTypes = {
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    noLabel: PropTypes.string,
    yesLabel: PropTypes.string,
};

BinarySelector.defaultProps = {
    noLabel: 'No',
    yesLabel: 'Yes',
};

Selector.Binary = BinarySelector;

export default Selector;
