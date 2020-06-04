import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import GenericTextEditor from './GenericTextEditor.react';
import { LogCategoryTypeahead } from './LogCategory.react';
import { LogValueListEditor } from './LogValue';
import PropTypes from './prop-types';

import deepcopy from '../common/deepcopy';

class LogEntryEditor extends React.Component {
    static createEmptyLogValue() {
        return {
            id: window.getNegativeID(),
            data: '',
            logKey: {
                id: window.getNegativeID(),
                name: '',
                type: 'string',
            },
        };
    }

    static createEmptyLogEntry() {
        return {
            title: '',
            logCategory: {
                id: window.getNegativeID(),
                name: '',
                logKeys: [],
            },
            logValues: [],
            details: '',
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            logEntry: this.props.logEntry || LogEntryEditor.createEmptyLogEntry(),
        };
    }

    getTitleRow() {
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
                    onChange={(event) => {
                        const { value } = event.target;
                        // eslint-disable-next-line no-param-reassign
                        this.updateLogEntry((logEntry) => { logEntry.title = value; });
                    }}
                />
            </InputGroup>
        );
    }

    getCategoryRow() {
        return (
            <InputGroup className="my-1" size="sm">
                <InputGroup.Prepend>
                    <InputGroup.Text style={{ width: 100 }}>
                        Category
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <LogCategoryTypeahead
                    logCategory={this.state.logEntry.logCategory}
                    onUpdate={(logCategory) => this.updateLogEntry((logEntry) => {
                        // eslint-disable-next-line no-param-reassign
                        logEntry.logCategory = logCategory;
                    })}
                />
            </InputGroup>
        );
    }

    getDetailsRow() {
        return (
            <GenericTextEditor
                value={this.state.logEntry.details}
                onUpdate={(value) => this.updateLogEntry((logEntry) => {
                    // eslint-disable-next-line no-param-reassign
                    logEntry.details = value;
                })}
            />
        );
    }

    updateLogEntry(method) {
        this.setState((state) => {
            const logEntry = deepcopy(state.logEntry);
            method(logEntry, state);
            return { logEntry };
        });
    }

    render() {
        return (
            <div>
                {this.getTitleRow()}
                {this.getCategoryRow()}
                <LogValueListEditor
                    logValues={this.state.logEntry.logValues}
                    onUpdate={(logValues) => this.setState((state) => {
                        const logEntry = { ...state.logEntry };
                        logEntry.logValues = logValues;
                        return { logEntry };
                    })}
                />
                <Button
                    onClick={() => this.setState((state) => {
                        const logEntry = { ...state.logEntry };
                        logEntry.logValues = [...logEntry.logValues];
                        logEntry.logValues.push(LogEntryEditor.createEmptyLogValue());
                        return { logEntry };
                    })}
                    size="sm"
                    variant="secondary"
                >
                    Add value?
                </Button>
                {this.getDetailsRow()}
            </div>
        );
    }
}

LogEntryEditor.propTypes = {
    logEntry: PropTypes.Custom.LogEntry,
};

class LogEntryList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { entries: null };
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        window.api.send('log-entry-list')
            .then((entries) => this.setState({ entries }));
    }

    render() {
        if (this.state.entries) {
            return <div>Loading Entries ...</div>;
        }
        return <LogEntryEditor />;
    }
}

export { LogEntryList };
