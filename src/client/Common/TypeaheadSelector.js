import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import { GiCancel } from 'react-icons/gi';
import React from 'react';
import PropTypes from 'prop-types';

import 'react-bootstrap-typeahead/css/Typeahead.min.css';
import { INCOMPLETE_KEY } from '../../data';


class TypeaheadSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: false, text: '', options: [] };
    }

    onInputChange(text) {
        this.setState({ text });
        this.onSearch(text);
    }

    onSearch(query) {
        this.setState({ isLoading: true }, () => {
            window.api.send(`${this.props.dataType}-typeahead`, { query, selector: this.props.selector })
                .then((options) => {
                    this.setState({ isLoading: false, options });
                });
        });
    }

    onChange(option) {
        if (option && option[INCOMPLETE_KEY]) {
            window.api.send(`${option.__type__}-load`, option)
                .then((result) => this.props.onChange(result));
        } else {
            this.props.onChange(option);
        }
    }

    renderDeleteButton() {
        if (!this.props.value) {
            return null;
        }
        return (
            <Button
                onClick={() => this.props.onChange(null)}
                size="sm"
                title="Cancel"
                variant="secondary"
            >
                <GiCancel />
            </Button>
        );
    }

    render() {
        const selected = this.props.value ? [this.props.value[this.props.labelKey]] : [];
        return (
            <>
                <AsyncTypeahead
                    {...this.state}
                    id={this.props.dataType}
                    labelKey={this.props.labelKey}
                    size="small"
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
                />
                {this.renderDeleteButton()}
            </>
        );
    }
}

TypeaheadSelector.propTypes = {
    dataType: PropTypes.string.isRequired,
    labelKey: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,

    placeholder: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
};

TypeaheadSelector.defaultProps = {
    labelKey: 'name',
};

export default TypeaheadSelector;
