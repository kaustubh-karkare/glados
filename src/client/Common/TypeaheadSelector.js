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
        let existingItems = [];
        if (this.props.multiple) {
            existingItems = this.props.value;
        } else {
            existingItems = (this.props.value ? [this.props.value] : []);
        }
        this.props.options
            .search(query, existingItems)
            .then((options) => this.setState({ isLoading: false, options }, this.forceUpdate));
    }

    async onChange(selected) {
        if (selected.length) {
            const index = selected.length - 1;
            const result = await this.props.options.select(selected[index]);
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
        if (this.props.disabled || !this.props.value) {
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
    options: PropTypes.instanceOf(TypeaheadOptions).isRequired,

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

TypeaheadSelector.getStringItem = (value, index = -1) => ({
    __type__: 'string',
    __id__: index + 1,
    name: value,
});

TypeaheadSelector.getStringListItems = (values) => {
    if (!values) return [];
    return values.map(TypeaheadSelector.getStringItem);
};

TypeaheadSelector.getStringListTypeaheadOptions = (fetcher) => new TypeaheadOptions({
    serverSideOptions: [],
    getComputedOptions: async (query) => {
        // Maybe skip fetching results if query is empty?
        let options = [];
        if (fetcher) {
            options = await fetcher(query);
        }
        options = TypeaheadSelector.getStringListItems(options);
        options.push(TypeaheadSelector.getStringItem(query));
        return options;
    },
});

export default TypeaheadSelector;
