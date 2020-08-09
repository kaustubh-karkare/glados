import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import { MdClose } from 'react-icons/md';
import React from 'react';
import PropTypes from 'prop-types';

import 'react-bootstrap-typeahead/css/Typeahead.min.css';


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
            .then((serverSideOptions) => this.setState({
                isLoading: false,
                options: serverSideOptions,
            }));
    }

    onChange(option) {
        window.api.send(`${option.__type__}-load`, option)
            .then((result) => this.props.onChange(result));
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
        const selected = this.props.value ? [this.props.value[this.props.labelKey]] : [];
        return (
            <>
                <AsyncTypeahead
                    {...this.state}
                    id={this.props.id}
                    labelKey={this.props.labelKey}
                    minLength={0}
                    disabled={this.props.disabled || this.props.value}
                    onFocus={() => this.onSearch(this.state.text)}
                    onSearch={(query) => this.onSearch(query)}
                    placeholder={this.props.placeholder}
                    selected={selected}
                    onInputChange={(text) => this.onInputChange(text)}
                    onChange={(newSelected) => {
                        if (newSelected.length) {
                            this.onChange(newSelected[0]);
                        }
                    }}
                    renderMenuItemChildren={
                        (option) => (
                            <div>{option[this.props.labelKey]}</div>
                        )
                    }
                    ref={this.ref}
                />
                {this.renderDeleteButton()}
            </>
        );
    }
}

TypeaheadSelector.propTypes = {
    id: PropTypes.string.isRequired,
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
