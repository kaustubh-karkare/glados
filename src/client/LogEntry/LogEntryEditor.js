import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import React from 'react';
import {
    DatePicker, SortableList, TextEditor, Typeahead,
} from '../Common';
import {
    LogEntry, LogStructure, LogValue, isRealItem, isVirtualItem,
} from '../../data';
import LogEntryTitleEditor, { TextEditorSources } from './LogEntryTitleEditor';
import LogEntryReminderEditor from './LogEntryReminderEditor';
import { LogValueEditor } from '../LogValue';
import PropTypes from '../prop-types';


class LogEntryEditor extends React.Component {
    updateLogEntry(method) {
        const logEntry = { ...this.props.logEntry };
        method(logEntry);
        LogEntry.trigger(logEntry);
        this.props.onUpdate(logEntry);
    }

    renderDateRow() {
        let valueComponent;
        if (this.props.logEntry.date === null) {
            valueComponent = (
                <Form.Control disabled value="Unspecified" />
            );
        } else {
            valueComponent = (
                <DatePicker
                    value={this.props.logEntry.date}
                    onChange={(newDate) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.date = newDate;
                    })}
                />
            );
        }
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Date
                </InputGroup.Text>
                {valueComponent}
            </InputGroup>
        );
    }

    renderTitleRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Title
                </InputGroup.Text>
                <LogEntryTitleEditor
                    logEntry={this.props.logEntry}
                    onUpdate={this.props.onUpdate}
                    onSpecialKeys={this.props.onSpecialKeys}
                />
            </InputGroup>
        );
    }

    renderAddLogValueButton() {
        if (isRealItem(this.props.logEntry.logStructure)) {
            return null;
        }
        return (
            <Button
                onClick={() => this.updateLogEntry((logEntry) => {
                    logEntry.logValues = [...logEntry.logValues, LogValue.createVirtual()];
                })}
                size="sm"
                variant="secondary"
            >
                <MdAddCircleOutline />
            </Button>
        );
    }

    renderStructureRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Structure
                </InputGroup.Text>
                <Typeahead
                    dataType="log-structure"
                    value={this.props.logEntry.logStructure}
                    onUpdate={(logStructure) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.logStructure = logStructure;
                        logEntry.logValues = logStructure.logKeys.map(
                            (logKey) => LogValue.createVirtual(logKey),
                        );
                    })}
                    allowDelete
                    onDelete={() => this.updateLogEntry((logEntry) => {
                        if (logEntry.logStructure.titleTemplate) {
                            logEntry.title = '';
                        }
                        // eslint-disable-next-line no-param-reassign
                        logEntry.logStructure = LogStructure.createVirtual();
                        logEntry.logValues = [];
                    })}
                />
                {false && this.renderAddLogValueButton()}
            </InputGroup>
        );
    }

    renderDetailsRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Details
                </InputGroup.Text>
                <TextEditor
                    value={this.props.logEntry.details}
                    onUpdate={(value) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.details = value;
                    })}
                    sources={TextEditorSources}
                    isMarkdown
                />
            </InputGroup>
        );
    }

    render() {
        return (
            <div>
                <div className="my-3">
                    {this.renderDateRow()}
                </div>
                {this.renderTitleRow()}
                {this.renderDetailsRow()}
                <div className="my-3">
                    {this.renderStructureRow()}
                    <SortableList
                        items={this.props.logEntry.logValues}
                        onChange={(logValues) => this.updateLogEntry((logEntry) => {
                            logEntry.logValues = logValues;
                        })}
                        type={LogValueEditor}
                        disabled={isRealItem(this.props.logEntry.logStructure.id)}
                        isNewStructure={isVirtualItem(this.props.logEntry.logStructure.id)}
                    />
                </div>
                <div className="my-3">
                    <LogEntryReminderEditor
                        logReminder={this.props.logEntry.logReminder}
                        onChange={(newReminder) => this.updateLogEntry((logEntry) => {
                            logEntry.logReminder = newReminder;
                        })}
                    />
                </div>
            </div>
        );
    }
}

LogEntryEditor.propTypes = {
    logEntry: PropTypes.Custom.LogEntry.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onSpecialKeys: PropTypes.func,
};

export default LogEntryEditor;
