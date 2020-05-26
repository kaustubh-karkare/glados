import React from 'react';
import PropTypes from 'prop-types';

class Dropdown extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <select
                value={this.props.value}
                onChange={this.props.onChange}
                disabled={this.props.disabled}
            >
                {this.props.options.map(option =>
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                )}
            </select>
        );
    }
}

const ValueType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

Dropdown.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: ValueType.isRequired,
        }).isRequired,
    ).isRequired,
    value: ValueType.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default Dropdown;
