import Form from 'react-bootstrap/Form';
import React from 'react';
import PropTypes from 'prop-types';

function Selector(props) {
    const { onChange, options, ...moreProps } = props;
    return (
        <Form.Control
            {...moreProps}
            as="select"
            onChange={(event) => onChange(event.target.value)}
            size="sm"
        >
            {options.map((item) => {
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
    const {
        noLabel, yesLabel, value, onChange, ...moreProps
    } = props;
    const options = [
        { label: noLabel, value: 'no' },
        { label: yesLabel, value: 'yes' },
    ];
    return (
        <Selector
            {...moreProps}
            value={options[value ? 1 : 0].value}
            options={options}
            onChange={(newValue) => onChange(newValue === options[1].value)}
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
