import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import GenericTextEditor from './GenericTextEditor.react';
import InputGroup from 'react-bootstrap/InputGroup';
import LeftRight from './LeftRight.react';
import {LogCategoryTypeahead} from './LogCategory.react';
import {LogValueListEditor} from './LogValue.react';
import PropTypes from './prop-types';
import React from 'react';

import deepcopy from '../common/deepcopy';

class LogEntryDetailsEditor extends React.Component {
    render() {}
}

LogEntryDetailsEditor.propTypes = {
    details: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

class LogEntryEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEntry: this.createEmptyLogEntry(),
        };
    }
    createEmptyLogEntry() {
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
    createEmptyLogValue() {
        return {
            id: window.getNegativeID(),
            data: '',
            logKey: {
                id: window.getNegativeID(),
                name: '',
                type: 'string',
            }
        };
    }
    render() {
        return (
            <div>
                {this.getTitleRow()}
                {this.getCategoryRow()}
                <LogValueListEditor
                    logValues={this.state.logEntry.logValues}
                    onUpdate={logValues => {
                        let logEntry = {...this.state.logEntry};
                        logEntry.logValues = logValues;
                        this.setState({logEntry});
                    }}
                />
                <Button
                    onClick={() => {
                        const logEntry = {...this.state.logEntry};
                        logEntry.logValues = [...logEntry.logValues, this.createEmptyLogValue()],
                        this.setState({logEntry});
                    }}
                    size="sm"
                    variant="secondary">
                    {'Add value?'}
                </Button>
                {this.getDetailsRow()}
            </div>
        );
    }
    getTitleRow() {
        return (
            <InputGroup className="my-1" size="sm">
                <InputGroup.Prepend>
                    <InputGroup.Text style={{width: 100}}>
                        {'Title'}
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    type="text"
                    value={this.state.logEntry.title}
                    onChange={event => {
                        const value = event.target.value;
                        this.updateLogEntry(logEntry => { logEntry.title = value; });
                    }}
                />
            </InputGroup>
        );
    }
    getCategoryRow() {
        return (
            <InputGroup className="my-1" size="sm">
                <InputGroup.Prepend>
                    <InputGroup.Text style={{width: 100}}>
                        {'Category'}
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <LogCategoryTypeahead
                    logCategory={this.state.logEntry.logCategory}
                    onUpdate={logCategory => {
                        this.updateLogEntry(logEntry => {
                            logEntry.logCategory = logCategory;
                        });
                    }}
                />
            </InputGroup>
        );
    }
    getDetailsRow() {
        return (
            <GenericTextEditor
                value={this.state.logEntry.details}
                onUpdate={value => {
                    this.updateLogEntry(logEntry => { logEntry.details = value; });
                }}
            />
        );
    }
    updateLogEntry(method) {
        this.setState(state => {
            const logEntry = deepcopy(state.logEntry);
            method(logEntry, state);
            return {logEntry};
        });
    }
}

LogEntryEditor.propTypes = {
    logEntry: PropTypes.Custom.LogEntry,
};

class LogEntryList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {entries: null};
    }
    componentDidMount() {
        this.reload();
    }
    reload() {
        window.api.send("log-entry-list")
            .then(entries => this.setState({entries}));
    }
    render() {
        if (this.state.entries) {
            return <div>{'Loading Entries ...'}</div>;
        }
        return <LogEntryEditor />;
    }
}

export {LogEntryList};
