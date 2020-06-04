import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import arrayMove from 'array-move';
import GenericTypeahead from './GenericTypeahead.react';
import { LogKeyTypeDropdown, LogKeyNameTypeahead } from './LogKey';
import PropTypes from './prop-types';
import { SortableDragHandle, SortableElement, SortableList } from './Sortable.react';


function LogValueDataTypeahead(props) {
    return (
        <GenericTypeahead
            id="log_value"
            labelKey="data"
            onUpdate={props.onUpdate}
            placeholder=""
            rpcName="log-value-typeahead"
            value={props.logValue}
        />
    );
}

LogValueDataTypeahead.propTypes = {
    logValue: PropTypes.Custom.LogValue.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

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

const LogValueEditorSortableItem = SortableElement(LogValueEditor);

class LogValueListEditor extends React.Component {
    onReorder({ oldIndex, newIndex }) {
        this.props.onUpdate(arrayMove(this.props.logValues, oldIndex, newIndex));
    }

    onUpdate(index, logValue) {
        const logValues = [...this.props.logValues];
        logValues[index] = logValue;
        this.props.onUpdate(logValues);
    }

    onDelete(index) {
        const logValues = [...this.props.logValues];
        logValues.splice(index, 1);
        this.props.onUpdate(logValues);
    }

    render() {
        return (
            <SortableList
                useDragHandle
                onSortEnd={(data) => this.onReorder(data)}
            >
                {this.props.logValues.map((logValue, index) => (
                    <LogValueEditorSortableItem
                        key={logValue.id}
                        index={index}
                        logValue={logValue}
                        onUpdate={(updatedLogValue) => this.onUpdate(index, updatedLogValue)}
                        onDelete={(deletedIndex) => this.onDelete(deletedIndex)}
                    />
                ))}
            </SortableList>
        );
    }
}

LogValueListEditor.propTypes = {
    logValues: PropTypes.arrayOf(PropTypes.Custom.LogValue.isRequired).isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export { LogValueEditor, LogValueListEditor };
