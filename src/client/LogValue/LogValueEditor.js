import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { LogKeyTypeDropdown, LogKeyNameTypeahead } from '../LogKey';
import LogValueDataTypeahead from './LogValueDataTypeahead';
import PropTypes from '../prop-types';
import { SortableDragHandle } from '../Sortable.react';


class LogValueEditor extends React.Component {
    updateLogKey(logKey) {
        const logValue = { ...this.props.logValue };
        logValue.logKey = logKey;
        this.props.onUpdate(logValue);
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
                        logKey={this.props.logValue.logKey}
                        onUpdate={(logKey) => this.updateLogKey(logKey)}
                    />
                </InputGroup.Prepend>
                <LogKeyNameTypeahead
                    logKey={this.props.logValue.logKey}
                    onUpdate={(logKey) => this.updateLogKey(logKey)}
                />
                <LogValueDataTypeahead
                    allowEdit
                    logValue={this.props.logValue}
                    onUpdate={this.props.onUpdate}
                />
                <InputGroup.Append>
                    <Button
                        onClick={this.props.onDelete}
                        size="sm"
                        variant="secondary"
                    >
                        🗑
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        );
    }
}

LogValueEditor.propTypes = {
    logValue: PropTypes.Custom.LogValue.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default LogValueEditor;
