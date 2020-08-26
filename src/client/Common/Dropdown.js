import Dropdown from 'react-bootstrap/Dropdown';
import React from 'react';
import PropTypes from 'prop-types';
import DataLoader from './DataLoader';

import './Dropdown.css';

class CustomDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isShown: false, options: [] };
        this.dataLoader = null;
    }

    componentDidMount() {
        if (Array.isArray(this.props.options)) {
            this.setOptions(this.props.options);
        } else {
            this.dataLoader = new DataLoader({
                getInput: () => this.props.options,
                onData: (options) => this.setOptions(options),
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

    hide() {
        this.setState({ isShown: false });
    }

    show() {
        this.setState({ isShown: true });
    }

    renderItems() {
        if (!this.state.options) return null;
        if (this.state.options.length === 0) {
            return (
                <Dropdown.Item disabled>
                    No Results
                </Dropdown.Item>
            );
        }
        return this.state.options.map((option) => (
            <Dropdown.Item
                key={option.id}
                onMouseDown={(event) => this.props.onChange(option, event)}
            >
                {option[this.props.labelKey]}
            </Dropdown.Item>
        ));
    }

    render() {
        return (
            <Dropdown
                as="span"
                onToggle={(isShown) => this.setState({ isShown })}
                show={this.state.isShown}
            >
                <Dropdown.Toggle as="span">
                    {this.props.children}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {this.renderItems()}
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
