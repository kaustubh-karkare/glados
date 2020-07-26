import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import React from 'react';
import PropTypes from 'prop-types';

class TypeaheadInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: false, options: [] };
    }

    onSearch(query) {
        this.setState({ isLoading: true }, () => {
            this.props.onSearch(query)
                .then((options) => this.setState({ isLoading: false, options }));
        });
    }

    render() {
        return (
            <>
                <AsyncTypeahead
                    id={this.props.id}
                    minLength={0}
                    disabled={this.props.disabled}
                    onFocus={() => this.onSearch(this.props.value)}
                    onSearch={(query) => this.onSearch(query)}
                    filterBy={this.props.filterBy}
                    placeholder={this.props.placeholder}
                    selected={[this.props.value]}
                    onInputChange={(newValue) => {
                        this.onSearch(newValue);
                        this.props.onChange(newValue);
                    }}
                    onChange={(newSelected) => {
                        if (newSelected.length) {
                            this.props.onChange(newSelected[0]);
                        }
                    }}
                    renderMenuItemChildren={(option) => <div>{option}</div>}
                    isLoading={this.state.isLoading}
                    options={this.state.options}
                />
            </>
        );
    }
}

TypeaheadInput.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,

    placeholder: PropTypes.string,
    filterBy: PropTypes.func,
};

export default TypeaheadInput;
