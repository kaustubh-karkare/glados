import Button from 'react-bootstrap/Button';
import GenericTypeahead from './GenericTypeahead.react';
import InputGroup from 'react-bootstrap/InputGroup';
import {LogKeyTypeDropdown, LogKeyNameTypeahead} from './LogKey.react';
import PropTypes from './prop-types';
import React from 'react';
import {SortableDragHandle, SortableElement, SortableList} from './Sortable.react';

import arrayMove from 'array-move';

class LogValueDataTypeahead extends React.Component {
    render() {
        return (
            <GenericTypeahead
                id="log_value"
                labelKey="data"
                onUpdate={this.props.onUpdate}
                placeholder=""
                rpcName="log-value-typeahead"
                value={this.props.logValue}
            />
        );
    }
}

LogValueDataTypeahead.propTypes = {
    logValue: PropTypes.Custom.LogValue.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

class LogValueEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isLoading: false, options: []};
    }
    render() {
        return (
            <InputGroup className="mb-1" size="sm">
                <InputGroup.Prepend>
                    <SortableDragHandle>
                        <InputGroup.Text style={{cursor: 'grab'}}>
                            {'⋮'}
                        </InputGroup.Text>
                    </SortableDragHandle>
                    <LogKeyTypeDropdown
                        logKey={this.props.logValue.logKey}
                        onUpdate={logKey => this.updateLogKey(logKey)}
                    />
                </InputGroup.Prepend>
                <LogKeyNameTypeahead
                    logKey={this.props.logValue.logKey}
                    onUpdate={logKey => this.updateLogKey(logKey)}
                />
                <LogValueDataTypeahead
                    logValue={this.props.logValue}
                    onUpdate={this.props.onUpdate}
                />
                <InputGroup.Append>
                    <Button
                        onClick={this.props.onDelete}
                        size="sm"
                        variant="secondary">
                        {'🗑'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        );
    }
    updateLogKey(logKey) {
        let logValue = {...this.props.logValue};
        logValue.logKey = logKey;
        this.props.onUpdate(logValue);
    }
}

LogValueEditor.propTypes = {
    logValue: PropTypes.Custom.LogValue.isRequired,
    onUpdate: PropTypes.func.isRequired,
}

const LogValueEditorSortableItem = SortableElement(LogValueEditor);

class LogValueListEditor extends React.Component {
    render() {
        return (
            <SortableList
                useDragHandle={true}
                onSortEnd={this.onReorder.bind(this)}>
                {this.props.logValues.map((logValue, index) =>
                    <LogValueEditorSortableItem
                        key={logValue.id}
                        index={index}
                        logValue={logValue}
                        onUpdate={this.onUpdate.bind(this, index)}
                        onDelete={this.onDelete.bind(this, index)}
                    />
                )}
            </SortableList>
        );
    }
    onReorder({oldIndex, newIndex}) {
        this.props.onUpdate(arrayMove(this.props.logValues, oldIndex, newIndex));
    }
    onUpdate(index, logValue) {
        const logValues = [...this.props.logValues];
        logValues[index] = logValue;
        this.props.onUpdate(logValues);
    }
    onDelete(index, logValue) {
        const logValues = [...this.props.logValues];
        logValues.splice(index, 1);
        this.props.onUpdate(logValues);
    }
}

LogValueListEditor.propTypes = {
    logValues: PropTypes.arrayOf(PropTypes.Custom.LogValue.isRequired).isRequired,
    onUpdate: PropTypes.func.isRequired,
}

export {LogValueEditor, LogValueListEditor};
