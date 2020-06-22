import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import React from 'react';
import { TextEditor, Typeahead } from '../Common';
import { LogEntry, LogCategory, LogValue } from '../../data';
import LogEntryTitleEditor, { TextEditorSources } from './LogEntryTitleEditor';
import { LogValueListEditor } from '../LogValue';
import PropTypes from '../prop-types';


class LogEntryEditor extends React.Component {
    updateLogEntry(method) {
        const logEntry = { ...this.props.logEntry };
        method(logEntry);
        LogEntry.trigger(logEntry);
        this.props.onUpdate(logEntry);
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
                />
            </InputGroup>
        );
    }

    renderAddLogValueButton() {
        if (this.props.logEntry.logCategory.id > 0) {
            return null;
        }
        return (
            <Button
                onClick={() => this.updateLogEntry((logEntry) => {
                    logEntry.logValues = [...logEntry.logValues, LogValue.createEmpty()];
                })}
                size="sm"
                variant="secondary"
            >
                <MdAddCircleOutline />
            </Button>
        );
    }

    renderCategoryRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Category
                </InputGroup.Text>
                <Typeahead
                    dataType="log-category"
                    value={this.props.logEntry.logCategory}
                    onUpdate={(logCategory) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.logCategory = logCategory;
                        logEntry.logValues = logCategory.logKeys.map(
                            (logKey) => LogValue.createEmpty(logKey),
                        );
                    })}
                    allowDelete
                    onDelete={() => this.updateLogEntry((logEntry) => {
                        if (logEntry.logCategory.template) {
                            logEntry.title = '';
                        }
                        // eslint-disable-next-line no-param-reassign
                        logEntry.logCategory = LogCategory.createEmpty();
                        logEntry.logValues = [];
                    })}
                />
                {this.renderAddLogValueButton()}
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
                {this.renderTitleRow()}
                {this.renderCategoryRow()}
                <LogValueListEditor
                    disabled={this.props.logEntry.logCategory.id > 0}
                    isNewCategory={this.props.logEntry.logCategory.id < 0}
                    logValues={this.props.logEntry.logValues}
                    onUpdate={(logValues) => this.updateLogEntry((logEntry) => {
                        logEntry.logValues = logValues;
                    })}
                />
                {this.renderDetailsRow()}
            </div>
        );
    }
}

LogEntryEditor.propTypes = {
    logEntry: PropTypes.Custom.LogEntry.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default LogEntryEditor;
