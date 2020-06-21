import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import React from 'react';
import { TextEditor, Typeahead } from '../Common';
import { LogValueListEditor } from '../LogValue';
import PropTypes from '../prop-types';

import {
    getNegativeID, LogCategory, LogEntry, LogValue,
} from '../../data';
import deepcopy from '../../common/deepcopy';

const textEditorSources = [
    { trigger: '@', dataType: 'log-tag' },
    { trigger: '#', dataType: 'log-tag' },
    // TODO: Move this to CompactEditor.
    { trigger: '!', dataType: 'log-entry' },
];

class LogEntryEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEntry: this.props.logEntry || LogEntry.createEmpty(),
        };
    }

    saveLogEntry(logEntry) {
        window.api.send('log-entry-upsert', logEntry)
            .then((result) => this.setState({ logEntry: result }));
    }

    updateLogEntry(method) {
        this.setState((state) => {
            const logEntry = deepcopy(state.logEntry);
            method(logEntry, state);
            LogEntry.trigger(logEntry);
            return { logEntry };
        });
    }

    renderTitleRow() {
        return (
            <InputGroup className="my-1" size="sm">
                <InputGroup.Text>
                    Title
                </InputGroup.Text>
                <TextEditor
                    value={this.state.logEntry.title}
                    sources={textEditorSources}
                    disabled={!!this.state.logEntry.logCategory.template}
                    onUpdate={(value) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.title = value;
                    })}
                    onSelectSuggestion={(option) => {
                        if (typeof option.title === 'undefined') return;
                        const logEntry = option;
                        LogEntry.trigger(logEntry);
                        logEntry.id = getNegativeID();
                        this.setState({ logEntry });
                    }}
                />
            </InputGroup>
        );
    }

    renderAddLogValueButton() {
        if (this.state.logEntry.logCategory.id > 0) {
            return null;
        }
        return (
            <InputGroup.Append>
                <Button
                    onClick={() => this.setState((state) => {
                        const logEntry = { ...state.logEntry };
                        logEntry.logValues = [...logEntry.logValues];
                        logEntry.logValues.push(LogValue.createEmpty());
                        return { logEntry };
                    })}
                    size="sm"
                    variant="secondary"
                >
                    <MdAddCircleOutline />
                </Button>
            </InputGroup.Append>
        );
    }

    renderCategoryRow() {
        return (
            <InputGroup className="my-1" size="sm">
                <InputGroup.Text>
                    Category
                </InputGroup.Text>
                <Typeahead
                    rpcName="log-category-list"
                    value={this.state.logEntry.logCategory}
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
                    value={this.state.logEntry.details}
                    sources={textEditorSources}
                    onUpdate={(value) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.details = value;
                    })}
                />
            </InputGroup>
        );
    }

    renderSaveButton() {
        return (
            <Button
                onClick={() => this.saveLogEntry(this.state.logEntry)}
                size="sm"
                variant="secondary"
            >
                Save
            </Button>
        );
    }

    render() {
        return (
            <div>
                {this.renderTitleRow()}
                {this.renderCategoryRow()}
                <LogValueListEditor
                    disabled={this.state.logEntry.logCategory.id > 0}
                    isNewCategory={this.state.logEntry.logCategory.id < 0}
                    logValues={this.state.logEntry.logValues}
                    onUpdate={(logValues) => this.setState((state) => {
                        const logEntry = { ...state.logEntry };
                        logEntry.logValues = logValues;
                        LogEntry.trigger(logEntry);
                        return { logEntry };
                    })}
                />
                {this.renderDetailsRow()}
                {this.renderSaveButton()}
            </div>
        );
    }
}

LogEntryEditor.propTypes = {
    logEntry: PropTypes.Custom.LogEntry,
};

export default LogEntryEditor;
