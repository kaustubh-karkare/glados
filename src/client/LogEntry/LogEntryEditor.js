import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import React from 'react';
import { TextEditor, Typeahead } from '../Common';
import { LogCategory, LogValue } from '../../data';
import { LogValueListEditor } from '../LogValue';
import PropTypes from '../prop-types';

const textEditorSources = [
    { trigger: '@', dataType: 'log-tag' },
    { trigger: '#', dataType: 'log-tag' },
    // TODO: Move this to CompactEditor.
    { trigger: '!', dataType: 'log-entry' },
];

class LogEntryEditor extends React.Component {
    updateLogEntry(method) {
        const logEntry = { ...this.props.logEntry };
        method(logEntry);
        this.props.onUpdate(logEntry);
    }

    renderTitleRow() {
        return (
            <InputGroup className="my-1" size="sm">
                <InputGroup.Text>
                    Title
                </InputGroup.Text>
                <TextEditor
                    value={this.props.logEntry.title}
                    sources={textEditorSources}
                    disabled={!!this.props.logEntry.logCategory.template}
                    onUpdate={(value) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.title = value;
                    })}
                    onSelectSuggestion={(option) => {
                        if (typeof option.title === 'undefined') return;
                        const logEntry = option;
                        logEntry.id = this.props.logEntry.id;
                        this.props.onUpdate(logEntry);
                    }}
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
            <InputGroup className="my-1" size="sm">
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
            <InputGroup className="my-1" size="sm">
                <InputGroup.Text>
                    Details
                </InputGroup.Text>
                <TextEditor
                    value={this.props.logEntry.details}
                    onUpdate={(value) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.details = value;
                    })}
                    sources={textEditorSources}
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
