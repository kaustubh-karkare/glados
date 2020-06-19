import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import { FaRegEdit } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';
import React from 'react';
import PropTypes from 'prop-types';

import 'react-bootstrap-typeahead/css/Typeahead.min.css';

const UPDATE_KEY = '__update_key__';

class Typeahead extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: false, options: [] };
    }

    renderUpdateButton() {
        if (this.props.value.id < 0 || !this.props.allowUpdate) {
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
                    id={this.props.id}
                    labelKey={this.props.labelKey}
                    size="small"
                    minLength={0}
                    disabled={
                        this.props.value.id > 0
                        && !this.props.value[UPDATE_KEY]
                    }
                    onFocus={() => this.onSearch(selectedOptionLabel)}
                    onSearch={(query) => this.onSearch(query)}
                    filterBy={this.props.filterBy}
                    placeholder={this.props.placeholder}
                    selected={[selectedOptionLabel]}
                    onInputChange={(text) => this.onInputChange(text)}
                    onChange={(selected) => {
                        if (selected.length) {
                            this.props.onUpdate(selected[0]);
                        }
                    }}
                    renderMenuItemChildren={
                        (option) => (
                            <div onMouseDown={() => this.props.onUpdate(option)}>
                                {option[this.props.labelKey]}
                            </div>
                        )
                    }
                />
                {this.renderUpdateButton()}
                {this.renderDeleteButton()}
            </>
        );
    }

    onInputChange(text) {
        this.onSearch(text);
        this.props.onUpdate({ ...this.props.value, [this.props.labelKey]: text });
    }

    onSearch(query) {
        this.setState({ isLoading: true }, () => {
            window.api.send(this.props.rpcName, this.props.value, query)
                .then((options) => {
                    this.setState({ isLoading: false, options });
                });
        });
    }
}

Typeahead.propTypes = {
    allowUpdate: PropTypes.bool,
    allowDelete: PropTypes.bool,
    filterBy: PropTypes.func,
    id: PropTypes.string.isRequired,
    labelKey: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    placeholder: PropTypes.string,
    rpcName: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any.isRequired,
};

export default Typeahead;
