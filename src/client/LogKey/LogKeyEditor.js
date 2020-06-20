import Button from 'react-bootstrap/Button';
import { FaRegTrashAlt } from 'react-icons/fa';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import LogKeyNameTypeahead from './LogKeyNameTypeahead';
import PropTypes from '../prop-types';
import { Dropdown, SortableDragHandle } from '../Common';

import { getLogKeyTypes } from '../../common/LogKey';


class LogKeyEditor extends React.Component {
    filterBy(option) {
        return (
            !this.props.filterBy
            || this.props.filterBy(this.props.sortableListItemIndex, option)
        );
    }

    render() {
        return (
            <InputGroup className="mb-1" size="sm">
                <InputGroup.Prepend>
                    <SortableDragHandle />
                    <Dropdown
                        value={this.props.logKey.type}
                        options={getLogKeyTypes()}
                        onUpdate={(type) => this.props.onUpdate({ ...this.props.logKey, type })}
                    />
                </InputGroup.Prepend>
                <LogKeyNameTypeahead
                    allowUpdate
                    logKey={this.props.logKey}
                    filterBy={(option) => this.filterBy(option)}
                    onUpdate={this.props.onUpdate}
                />
                <InputGroup.Append>
                    <Button
                        onClick={this.props.onDelete}
                        size="sm"
                        title="Delete LogValue"
                        variant="secondary"
                    >
                        <FaRegTrashAlt />
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        );
    }
}

LogKeyEditor.propTypes = {
    sortableListItemIndex: PropTypes.number,
    logKey: PropTypes.Custom.LogKey.isRequired,
    filterBy: PropTypes.func,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default LogKeyEditor;
