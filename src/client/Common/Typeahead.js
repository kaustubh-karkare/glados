import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import { FaRegEdit } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';
import React from 'react';
import PropTypes from 'prop-types';

import 'react-bootstrap-typeahead/css/Typeahead.min.css';
import { INCOMPLETE_KEY, UPDATE_KEY } from '../../data';


class Typeahead extends React.Component {
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
            window.api.send(`${this.props.dataType}-typeahead`, { query })
                .then((options) => {
                    this.setState({ isLoading: false, options });
                });
        });
    }

    onUpdate(option) {
        if (option && option[INCOMPLETE_KEY]) {
            window.api.send(`${option.__type__}-load`, option)
                .then((result) => this.props.onUpdate(result));
        } else {
            this.props.onUpdate(option);
        }
    }

    renderUpdateButton() {
        if (!(this.props.value && this.props.allowUpdate)) {
            return null;
        }
        return (
            <Button
                onClick={() => {
                    if (this.props.value[UPDATE_KEY]) {
                        this.props.onUpdate({ ...this.props.value, [UPDATE_KEY]: false });
                    } else {
                        this.props.onUpdate({ ...this.props.value, [UPDATE_KEY]: true });
                    }
                }}
                size="sm"
                title="Edit"
                variant="secondary"
            >
                {this.props.value[UPDATE_KEY] ? <GiCancel /> : <FaRegEdit />}
            </Button>
        );
    }

    renderDeleteButton() {
        if (!(this.props.value && this.props.allowDelete)) {
            return null;
        }
        return (
            <Button
                onClick={() => this.props.onUpdate(null)}
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
                    disabled={this.props.value ? !this.props.value[UPDATE_KEY] : false}
                    onFocus={() => this.onSearch(this.state.text)}
                    onSearch={(query) => this.onSearch(query)}
                    filterBy={this.props.filterBy}
                    placeholder={this.props.placeholder}
                    selected={selected}
                    onInputChange={(text) => this.onInputChange(text)}
                    onChange={(newSelected) => {
                        if (newSelected.length) {
                            this.onUpdate(newSelected[0]);
                        }
                    }}
                    renderMenuItemChildren={
                        (option) => (
                            <div>{option[this.props.labelKey]}</div>
                        )
                    }
                />
                {this.renderUpdateButton()}
                {this.renderDeleteButton()}
            </>
        );
    }
}

Typeahead.propTypes = {
    allowUpdate: PropTypes.bool,
    allowDelete: PropTypes.bool,
    filterBy: PropTypes.func,
    labelKey: PropTypes.string,
    onUpdate: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    dataType: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
};

Typeahead.defaultProps = {
    labelKey: 'name',
};

export default Typeahead;
