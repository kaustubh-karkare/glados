import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import { FaRegEdit } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';
import React from 'react';
import PropTypes from 'prop-types';

import 'react-bootstrap-typeahead/css/Typeahead.min.css';
import Utils from '../../data/Utils';


class Typeahead extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: false, options: [] };
    }

    onInputChange(text) {
        this.onSearch(text);
        this.props.onUpdate({ ...this.props.value, [this.props.labelKey]: text });
    }

    onSearch(query) {
        this.setState({ isLoading: true }, () => {
            window.api.send(`${this.props.dataType}-typeahead`, { item: this.props.value }, query)
                .then((options) => {
                    this.setState({ isLoading: false, options });
                });
        });
    }

    onUpdate(option) {
        if (option[Utils.INCOMPLETE_KEY]) {
            window.api.send(`${option.__type__}-load`, option)
                .then((result) => this.props.onUpdate(result));
        } else {
            this.props.onUpdate(option);
        }
    }

    renderUpdateButton() {
        if (this.props.value.id < 0 || !this.props.allowUpdate) {
            return null;
        }
        return (
            <Button
                onClick={() => {
                    if (this.props.value[Utils.UPDATE_KEY]) {
                        this.props.onUpdate({ ...this.props.value, [Utils.UPDATE_KEY]: false });
                    } else {
                        this.props.onUpdate({ ...this.props.value, [Utils.UPDATE_KEY]: true });
                    }
                }}
                size="sm"
                title="Edit"
                variant="secondary"
            >
                {this.props.value[Utils.UPDATE_KEY] ? <GiCancel /> : <FaRegEdit />}
            </Button>
        );
    }

    renderDeleteButton() {
        if (!this.props.allowDelete || this.props.value.id < 0) {
            return null;
        }
        return (
            <Button
                onClick={() => this.props.onDelete(this.props.value)}
                size="sm"
                title="Cancel"
                variant="secondary"
            >
                <GiCancel />
            </Button>
        );
    }

    render() {
        const selectedOptionLabel = this.props.value[this.props.labelKey];
        return (
            <>
                <AsyncTypeahead
                    {...this.state}
                    id={this.props.dataType}
                    labelKey={this.props.labelKey}
                    size="small"
                    minLength={0}
                    disabled={
                        this.props.value.id > 0
                        && !this.props.value[Utils.UPDATE_KEY]
                    }
                    onFocus={() => this.onSearch(selectedOptionLabel)}
                    onSearch={(query) => this.onSearch(query)}
                    filterBy={this.props.filterBy}
                    placeholder={this.props.placeholder}
                    selected={[selectedOptionLabel]}
                    onInputChange={(text) => this.onInputChange(text)}
                    onChange={(selected) => {
                        if (selected.length) {
                            this.onUpdate(selected[0]);
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

Typeahead.isUpdating = (value) => !!value[Utils.UPDATE_KEY];

Typeahead.propTypes = {
    allowUpdate: PropTypes.bool,
    allowDelete: PropTypes.bool,
    filterBy: PropTypes.func,
    labelKey: PropTypes.string,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    placeholder: PropTypes.string,
    dataType: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any.isRequired,
};

Typeahead.defaultProps = {
    labelKey: 'name',
};

export default Typeahead;
