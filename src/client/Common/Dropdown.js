import Dropdown from 'react-bootstrap/Dropdown';
import React from 'react';
import PropTypes from 'prop-types';
import DataLoader from './DataLoader';

import './Dropdown.css';

class CustomDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = { options: [] };
        this.dataLoader = null;
    }

    componentDidMount() {
        if (Array.isArray(this.props.options)) {
            this.setOptions(this.props.options);
        } else {
            this.dataLoader = new DataLoader({
                getInput: () => this.props.options,
                callback: (options) => this.setOptions(options),
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.dataLoader) this.dataLoader.reload();
    }

    componentWillUnmount() {
        if (this.dataLoader) this.dataLoader.stop();
    }

    setOptions(options) {
        this.setState({
            options: [...this.props.prefixOptions, ...options, ...this.props.suffixOptions],
        });
    }

    render() {
        return (
            <Dropdown as="span">
                <Dropdown.Toggle as="span">
                    {this.props.children}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {this.state.options.map((option) => (
                        <Dropdown.Item
                            key={option.id}
                            onMouseDown={() => this.props.onChange(option)}
                        >
                            {option[this.props.labelKey]}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

CustomDropdown.propTypes = {
    labelKey: PropTypes.string,
    // eslint-disable-next-line react/no-unused-prop-types
    disabled: PropTypes.bool.isRequired,
    options: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    prefixOptions: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    suffixOptions: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

CustomDropdown.defaultProps = {
    labelKey: 'name',
    prefixOptions: [],
    suffixOptions: [],
};

export default CustomDropdown;
