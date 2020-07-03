import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import deepcopy from '../../common/deepcopy';
import {
    DatePicker, TextEditor, TextInput, Typeahead,
} from '../Common';
import { LogEntry } from '../../data';
import PropTypes from '../prop-types';


class LogEntryEditor extends React.Component {
    updateLogEntry(method) {
        const logEntry = { ...this.props.logEntry };
        method(logEntry);
        LogEntry.trigger(logEntry);
        this.props.onChange(logEntry);
    }

    updateLogValue(index, value) {
        const logEntry = deepcopy(this.props.logEntry);
        logEntry.logStructure.logKeys[index].value = value;
        LogEntry.trigger(logEntry);
        this.props.onChange(logEntry);
    }

    renderDateRow() {
        let element;
        if (this.props.logEntry.date) {
            element = (
                <DatePicker
                    value={this.props.logEntry.date}
                    disabled={this.props.disabled}
                    onChange={(newDate) => this.updateLogEntry((logEntry) => {
                        logEntry.date = newDate;
                    })}
                />
            );
        } else {
            element = <TextInput disabled value="NA" />;
        }
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Date
                </InputGroup.Text>
                {element}
            </InputGroup>
        );
    }

    renderTitleRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Title
                </InputGroup.Text>
                <TextEditor
                    isSingleLine
                    focusOnLoad
                    value={this.props.logEntry.title}
                    serverSideTypes={['log-topic']}
                    disabled={this.props.disabled || !!this.props.logEntry.logStructure}
                    onChange={(newTitle) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.title = newTitle;
                    })}
                    onSpecialKeys={this.props.onSpecialKeys}
                />
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
                    serverSideTypes={['log-topic']}
                    disabled={this.props.disabled}
                    onChange={(value) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.details = value;
                    })}
                />
            </InputGroup>
        );
    }

    renderStructureSelector() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Structure
                </InputGroup.Text>
                <Typeahead
                    dataType="log-structure"
                    value={this.props.logEntry.logStructure}
                    disabled={this.props.disabled}
                    onChange={(logStructure) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        if (logStructure) {
                            logStructure.logKeys.forEach((logKey) => {
                                logKey.value = '';
                            });
                        }
                        logEntry.logStructure = logStructure;
                    })}
                    allowDelete
                />
            </InputGroup>
        );
    }

    renderStructureValues() {
        const { logEntry } = this.props;
        if (!logEntry.logStructure) {
            return null;
        }
        return logEntry.logStructure.logKeys.map((logKey, index) => (
            <InputGroup key={logKey.name} className="my-1">
                <InputGroup.Text>
                    {logKey.name}
                </InputGroup.Text>
                <TextInput
                    value={logKey.value}
                    disabled={this.props.disabled}
                    onChange={(newValue) => this.updateLogValue(index, newValue)}
                />
            </InputGroup>
        ));
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
                    {this.renderStructureSelector()}
                    {this.renderStructureValues()}
                </div>
            </div>
        );
    }
}

LogEntryEditor.propTypes = {
    logEntry: PropTypes.Custom.LogEntry.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSpecialKeys: PropTypes.func,
};

export default LogEntryEditor;
