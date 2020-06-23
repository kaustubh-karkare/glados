import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import React from 'react';
import { SortableList, TextEditor, Typeahead } from '../Common';
import {
    LogEntry, LogCategory, LogValue, isRealItem, isVirtualItem,
} from '../../data';
import LogEntryTitleEditor, { TextEditorSources } from './LogEntryTitleEditor';
import { LogValueEditor } from '../LogValue';
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
        if (isRealItem(this.props.logEntry.logCategory)) {
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
                            (logKey) => LogValue.createVirtual(logKey),
                        );
                    })}
                    allowDelete
                    onDelete={() => this.updateLogEntry((logEntry) => {
                        if (logEntry.logCategory.template) {
                            logEntry.title = '';
                        }
                        // eslint-disable-next-line no-param-reassign
                        logEntry.logCategory = LogCategory.createVirtual();
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
                <SortableList
                    items={this.props.logEntry.logValues}
                    onChange={(logValues) => this.updateLogEntry((logEntry) => {
                        logEntry.logValues = logValues;
                    })}
                    type={LogValueEditor}
                    disabled={isRealItem(this.props.logEntry.logCategory.id)}
                    isNewCategory={isVirtualItem(this.props.logEntry.logCategory.id)}
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
