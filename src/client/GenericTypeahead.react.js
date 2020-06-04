import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import { FaRegEdit } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';
import React from 'react';
import PropTypes from 'prop-types';

import 'react-bootstrap-typeahead/css/Typeahead.css';

const RENAME_KEY = '__rename_key__';

class GenericTypeahead extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: false, options: [] };
    }

    renderEditButtons() {
        if (!this.props.allowEditing) {
            return null;
        }
        return (
            <>
                <Button
                    onClick={() => {
                        this.props.onUpdate({ ...this.props.value, [RENAME_KEY]: true });
                    }}
                    size="sm"
                    title="Edit"
                    variant="secondary"
                >
                    <FaRegEdit />
                </Button>
                <Button
                    size="sm"
                    title="Cancel"
                    variant="secondary"
                >
                    <GiCancel />
                </Button>
            </>
        );
    }

    render() {
        const { value } = this.props;
        return (
            <>
                <AsyncTypeahead
                    {...this.state}
                    id={this.props.id}
                    labelKey={this.props.labelKey}
                    size="small"
                    minLength={0}
                    disabled={
                        value
                        && value.id > 0
                        && !value[RENAME_KEY]
                    }
                    onSearch={(query) => {
                        this.setState({ isLoading: true }, () => {
                            window.api.send(this.props.rpcName, value, query)
                                .then((options) => this.setState({ isLoading: false, options }));
                        });
                    }}
                    filterBy={this.props.filterBy}
                    placeholder={this.props.placeholder}
                    selected={[value && value[this.props.labelKey]]}
                    onInputChange={
                        (text) => this.props.onUpdate({ ...value, [this.props.labelKey]: text })
                    }
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
                {this.renderEditButtons()}
            </>
        );
    }
}

GenericTypeahead.propTypes = {
    allowEditing: PropTypes.bool,
    filterBy: PropTypes.func,
    id: PropTypes.string.isRequired,
    labelKey: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    rpcName: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any.isRequired,
};

export default GenericTypeahead;
