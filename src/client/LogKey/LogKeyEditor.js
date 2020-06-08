import Button from 'react-bootstrap/Button';
import { FaRegTrashAlt } from 'react-icons/fa';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import LogKeyNameTypeahead from './LogKeyNameTypeahead';
import LogKeyTypeDropdown from './LogKeyTypeDropdown';
import PropTypes from '../prop-types';
import { SortableDragHandle } from '../Common';

class LogKeyEditor extends React.Component {
    onUpdate(name, value) {
        const logKey = { ...this.props.logKey };
        logKey[name] = value;
        this.props.onUpdate(logKey);
    }

    render() {
        return (
            <InputGroup className="mb-1" size="sm">
                <InputGroup.Prepend>
                    <SortableDragHandle>
                        <InputGroup.Text style={{ cursor: 'grab' }}>
                            ⋮
                        </InputGroup.Text>
                    </SortableDragHandle>
                    <LogKeyTypeDropdown
                        logKey={this.props.logKey}
                        onUpdate={this.props.onUpdate}
                    />
                </InputGroup.Prepend>
                <LogKeyNameTypeahead
                    allowEditing={this.props.allowEditing}
                    logKey={this.props.logKey}
                    filterBy={this.props.filterBy}
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
    allowEditing: PropTypes.bool.isRequired,
    logKey: PropTypes.Custom.LogKey.isRequired,
    filterBy: PropTypes.func,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default LogKeyEditor;
