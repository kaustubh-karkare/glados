import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import React from 'react';
import { TextEditor } from '../Common';
import { LogCategoryTypeahead } from '../LogCategory';
import { LogValueListEditor } from '../LogValue';
import PropTypes from '../prop-types';

import { createEmptyLogCategory, createEmptyLogEntry, createEmptyLogValue } from '../Data';
import deepcopy from '../../common/deepcopy';

import { materializeCategoryTemplate } from '../../common/LogCategory';

class LogEntryEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEntry: this.props.logEntry || createEmptyLogEntry(),
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
            if (logEntry.logCategory.template) {
                logEntry.title = materializeCategoryTemplate(
                    logEntry.logCategory.template,
                    logEntry.logValues,
                );
            }
            return { logEntry };
        });
    }

    renderTitleRow() {
        return (
            <InputGroup className="my-1" size="sm">
                <InputGroup.Prepend>
                    <InputGroup.Text style={{ width: 100 }}>
                        Title
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    type="text"
                    value={this.state.logEntry.title}
                    disabled={!!this.state.logEntry.logCategory.template}
                    onChange={(event) => {
                        const { value } = event.target;
                        // eslint-disable-next-line no-param-reassign
                        this.updateLogEntry((logEntry) => { logEntry.title = value; });
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
                        logEntry.logValues.push(createEmptyLogValue());
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
                <InputGroup.Prepend>
                    <InputGroup.Text style={{ width: 100 }}>
                        Category
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <LogCategoryTypeahead
                    allowDelete
                    logCategory={this.state.logEntry.logCategory}
                    onUpdate={(logCategory) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.logCategory = logCategory;
                        logEntry.logValues = logCategory.logKeys.map(
                            (logKey) => createEmptyLogValue(logKey),
                        );
                    })}
                    onDelete={() => this.updateLogEntry((logEntry) => {
                        if (logEntry.logCategory.template) {
                            logEntry.title = '';
                        }
                        // eslint-disable-next-line no-param-reassign
                        logEntry.logCategory = createEmptyLogCategory();
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
                <InputGroup.Prepend>
                    <InputGroup.Text style={{ width: 99 }}>
                        Details
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <TextEditor
                    value={this.state.logEntry.details}
                    sources={[
                        { trigger: '@', rpcName: 'log-tag-typeahead' },
                        { trigger: '#', rpcName: 'log-tag-typeahead' },
                    ]}
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
                    allowReordering={this.state.logEntry.logCategory.id < 0}
                    isNewCategory={this.state.logEntry.logCategory.id < 0}
                    logValues={this.state.logEntry.logValues}
                    onUpdate={(logValues) => this.setState((state) => {
                        const logEntry = { ...state.logEntry };
                        logEntry.logValues = logValues;
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
