import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import { MdClose } from 'react-icons/md';
import React from 'react';
import PropTypes from 'prop-types';
import TypeaheadOptions from './TypeaheadOptions';

import 'react-bootstrap-typeahead/css/Typeahead.min.css';
import './TypeaheadSelector.css';

class TypeaheadSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: false, text: '', options: [] };
        this.ref = React.createRef();
    }

    onInputChange(text) {
        this.setState({ text });
        this.onSearch(text);
    }

    onSearch(query) {
        this.setState({ isLoading: true });
        TypeaheadOptions.get(this.props.options || this.props.serverSideTypes)
            .search(query)
            .then((options) => this.setState({ isLoading: false, options }));
    }

    async onChange(selected) {
        if (selected.length) {
            const index = selected.length - 1;
            const result = await TypeaheadOptions.get(
                this.props.options || this.props.serverSideTypes,
            ).select(selected[index]);
            if (result) {
                selected[index] = result;
            } else if (result === null) {
                return;
            }
        }
        if (this.props.multiple) {
            this.props.onChange(selected);
        } else {
            this.props.onChange(selected[0] || null);
        }
    }

    focus() {
        this.ref.current.focus();
    }

    renderDeleteButton() {
        if (!this.props.value) {
            return null;
        }
        return (
            <Button
                onClick={() => this.props.onChange(null)}
                title="Cancel"
            >
                <MdClose style={{ fill: 'white !important' }} />
            </Button>
        );
    }

    render() {
        const commonProps = {
            ...this.state,
            id: this.props.id,
            labelKey: 'name',
            minLength: 0,
            onFocus: () => this.onSearch(this.state.text),
            onSearch: (query) => this.onSearch(query),
            placeholder: this.props.placeholder,
            onInputChange: (text) => this.onInputChange(text),
            onChange: (selected) => this.onChange(selected),
            filterBy: (option, props) => true,
            renderMenuItemChildren: (option) => <div>{option.name}</div>,
            ref: this.ref,
        };
        if (this.props.multiple) {
            return (
                <AsyncTypeahead
                    {...commonProps}
                    multiple
                    disabled={this.props.disabled}
                    selected={this.props.value}
                />
            );
        }
        return (
            <>
                <AsyncTypeahead
                    {...commonProps}
                    disabled={this.props.disabled || this.props.value}
                    selected={this.props.value ? [this.props.value] : []}
                />
                {this.renderDeleteButton()}
            </>
        );
    }
}

TypeaheadSelector.propTypes = {
    id: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
    serverSideTypes: PropTypes.arrayOf(PropTypes.string.isRequired),
    options: PropTypes.instanceOf(TypeaheadOptions),

    value: PropTypes.oneOfType([
        // eslint-disable-next-line react/no-typos
        PropTypes.Custom.Item,
        PropTypes.arrayOf(PropTypes.Custom.Item),
    ]),
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,

    placeholder: PropTypes.string,
};

TypeaheadSelector.defaultProps = {
    multiple: false,
};

export default TypeaheadSelector;
