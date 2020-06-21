import Button from 'react-bootstrap/Button';
import { FaRegTrashAlt } from 'react-icons/fa';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { Dropdown, SortableDragHandle, Typeahead } from '../Common';

import LogKey from '../../data/LogKey';


class LogKeyEditor extends React.Component {
    filterBy(option) {
        return (
            !this.props.filterBy
            || this.props.filterBy(this.props.sortableListItemIndex, option)
        );
    }

    render() {
        const { logKey } = this.props;
        return (
            <InputGroup className="mb-1" size="sm">
                <SortableDragHandle disabled={this.props.sortableListItemDisabled} />
                <Dropdown
                    value={logKey.type}
                    options={LogKey.getTypes()}
                    onUpdate={(type) => this.props.onUpdate({ ...logKey, type })}
                />
                <Typeahead
                    allowUpdate
                    dataType="log-key"
                    value={logKey}
                    onUpdate={this.props.onUpdate}
                />
                <Button
                    onClick={this.props.onDelete}
                    size="sm"
                    title="Delete LogValue"
                    variant="secondary"
                >
                    <FaRegTrashAlt />
                </Button>
            </InputGroup>
        );
    }
}

LogKeyEditor.propTypes = {
    sortableListItemDisabled: PropTypes.bool,
    sortableListItemIndex: PropTypes.number,
    logKey: PropTypes.Custom.LogKey.isRequired,
    filterBy: PropTypes.func,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default LogKeyEditor;
