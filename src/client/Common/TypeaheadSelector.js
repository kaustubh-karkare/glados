import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import { MdClose } from 'react-icons/md';
import React from 'react';
import PropTypes from 'prop-types';

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
        window.api.send('typeahead', { query, dataTypes: this.props.serverSideTypes })
            .then((serverSideOptions) => {
                const options = [...serverSideOptions, ...this.props.clientSideOptions];
                this.setState({ isLoading: false, options });
            });
    }

    onChange(selected) {
        if (this.props.multiple) {
            this.props.onChange(selected);
        } else if (selected.length) {
            this.props.onChange(selected[0]);
        }
        // window.api.send(`${option.__type__}-load`, option)
        //     .then((result) => this.props.onChange(result));
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
            labelKey: this.props.labelKey,
            minLength: 0,
            onFocus: () => this.onSearch(this.state.text),
            onSearch: (query) => this.onSearch(query),
            placeholder: this.props.placeholder,
            onInputChange: (text) => this.onInputChange(text),
            onChange: (selected) => this.onChange(selected),
            renderMenuItemChildren: (option) => <div>{option[this.props.labelKey]}</div>,
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
                    selected={this.props.value ? [this.props.value[this.props.labelKey]] : []}
                />
                {this.renderDeleteButton()}
            </>
        );
    }
}

TypeaheadSelector.propTypes = {
    id: PropTypes.string.isRequired,
    multiple: PropTypes.bool.isRequired,
    clientSideOptions: PropTypes.arrayOf(
        PropTypes.any,
    ),
    serverSideTypes: PropTypes.arrayOf(
        PropTypes.string.isRequired,
    ),

    labelKey: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,

    placeholder: PropTypes.string,
};

TypeaheadSelector.defaultProps = {
    labelKey: 'name',
};

export default TypeaheadSelector;
