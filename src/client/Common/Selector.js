/* eslint-disable max-classes-per-file */

import Form from 'react-bootstrap/Form';
import React from 'react';
import PropTypes from 'prop-types';

class Selector extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    focus() {
        this.ref.current.focus();
    }

    render() {
        const { onChange, options, ...moreProps } = this.props;
        return (
            <Form.Control
                {...moreProps}
                as="select"
                onChange={(event) => onChange(event.target.value)}
                ref={this.ref}
            >
                {options.map((item) => {
                    const optionProps = { key: item.value, value: item.value };
                    return <option {...optionProps}>{item.label}</option>;
                })}
            </Form.Control>
        );
    }
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

Selector.getStringListOptions = (items) => items.map((item) => ({
    label: item,
    value: item,
}));

class BinarySelector extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    focus() {
        this.ref.current.focus();
    }

    render() {
        const {
            noLabel, yesLabel, value, onChange, ...moreProps
        } = this.props;
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
                ref={this.ref}
            />
        );
    }
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
