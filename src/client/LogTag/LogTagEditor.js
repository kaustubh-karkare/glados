import Button from 'react-bootstrap/Button';
import { FaSave, FaRegTrashAlt } from 'react-icons/fa';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import { Dropdown, Typeahead } from '../Common';

import { getLogTagTypes } from '../../common/LogTag';

class LogTagEditor extends React.Component {
    onUpdate(method) {
        const logTag = { ...this.props.logTag };
        method(logTag);
        this.props.onUpdate(logTag);
    }

    renderSaveOrDeleteButton() {
        if (this.props.logTag.id < 0 || Typeahead.isUpdating(this.props.logTag)) {
            return (
                <Button
                    onClick={this.props.onSave}
                    size="sm"
                    title="Create New"
                    variant="secondary"
                >
                    <FaSave />
                </Button>
            );
        }
        return (
            <Button
                onClick={this.props.onDelete}
                size="sm"
                title="Delete"
                variant="secondary"
            >
                <FaRegTrashAlt />
            </Button>
        );
    }

    render() {
        const { logTag } = this.props;
        return (
            <InputGroup className="mb-1" size="sm">
                <InputGroup.Prepend>
                    <Dropdown
                        value={logTag.type}
                        options={getLogTagTypes()}
                        onUpdate={(type) => this.props.onUpdate({ ...logTag, type })}
                    />
                </InputGroup.Prepend>
                <Typeahead
                    allowUpdate
                    id="log_tag"
                    rpcName="log-tag-list"
                    value={this.props.logTag}
                    onUpdate={this.props.onUpdate}
                />
                <InputGroup.Append>
                    {this.renderSaveOrDeleteButton()}
                </InputGroup.Append>
            </InputGroup>
        );
    }
}

LogTagEditor.propTypes = {
    logTag: PropTypes.Custom.LogTag.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    onDelete: PropTypes.func,
};


export default LogTagEditor;
