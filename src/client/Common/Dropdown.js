import Dropdown from 'react-bootstrap/Dropdown';
import React from 'react';
import PropTypes from 'prop-types';
import TypeaheadOptions from './TypeaheadOptions';

import './Dropdown.css';

class CustomDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isShown: false };
    }

    componentDidMount() {
        if (Array.isArray(this.props.options)) {
            this.setState({ items: this.props.options });
        }
    }

    onSelect(item, event) {
        if (this.props.options instanceof TypeaheadOptions) {
            this.props.options.select(item)
                .then((adjustedItem) => {
                    // undefined = no change
                    // null = cancel operation
                    if (adjustedItem !== null) {
                        this.props.onChange(adjustedItem || item, event);
                    }
                });
        } else {
            this.props.onChange(item, event);
        }
    }

    setIsShown(nextIsShown) {
        if (nextIsShown) {
            this.show();
        } else {
            this.hide();
        }
    }

    hide() {
        this.setState({ isShown: false });
    }

    show() {
        if (this.props.options instanceof TypeaheadOptions) {
            this.props.options.search('')
                .then((items) => this.setState({ isShown: true, items }));
        } else {
            this.setState({ isShown: true });
        }
    }

    renderItems() {
        if (!this.state.items) return null;
        if (this.state.items.length === 0) {
            return (
                <Dropdown.Item disabled>
                    No Results
                </Dropdown.Item>
            );
        }
        return this.state.items.map((item) => (
            <Dropdown.Item
                key={item.id}
                onMouseDown={(event) => this.onSelect(item, event)}
            >
                {item[this.props.labelKey]}
            </Dropdown.Item>
        ));
    }

    render() {
        return (
            <Dropdown
                as="span"
                onToggle={(isShown) => this.setIsShown(isShown)}
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
        PropTypes.instanceOf(TypeaheadOptions),
        PropTypes.array,
    ]).isRequired,
    onChange: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

CustomDropdown.defaultProps = {
    labelKey: 'name',
};

export default CustomDropdown;
