import React from 'react';
import PropTypes from './prop-types';
import deepcopy from '../common/deepcopy';
import LogKeyTypes from '../common/log_key_types';
import LeftRight from './LeftRight.react';
import {LogKeyTypeDropdown, LogKeyNameTypeahead} from './LogKey.react';

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

class LogValueEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isLoading: false, options: []};
    }
    render() {
        return (
            <InputGroup className="mb-1" size="sm">
                <InputGroup.Prepend>
                    <LogKeyTypeDropdown
                        logKey={this.props.logValue.logKey}
                        onUpdate={logKey => this.updateLogKey(logKey)}
                    />
                </InputGroup.Prepend>
                <LogKeyNameTypeahead
                    logKey={this.props.logValue.logKey}
                    onUpdate={logKey => this.updateLogKey(logKey)}
                />
            </InputGroup>
        );
    }
    updateLogKey(logKey) {
        let logValue = deepcopy(this.props.logValue);
        logValue.logKey = logKey;
        this.props.onUpdate(logValue);
    }
}

LogValueEditor.propTypes = {
    logValue: PropTypes.Custom.LogValue.isRequired,
    onUpdate: PropTypes.func.isRequired,
}

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
            logCategory: null,
            logValues: [this.createEmptyLogValue()],
        };
    }
    createEmptyLogValue() {
        return {
            id: -1,
            data: '',
            logKey: {
                id: -1,
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
                {this.state.logEntry.logValues.map((logValue, index) =>
                    <LogValueEditor
                        key={logValue.id}
                        logValue={logValue}
                        onUpdate={logValue => {
                            let logEntry = deepcopy(this.state.logEntry);
                            logEntry.logValues[index] = logValue;
                            this.setState({logEntry});
                        }}
                    />
                )}
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
                        this.updateLogEntry(logEntry => {
                            logEntry.title = value;
                        });
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
                <Form.Control
                    type="text"
                    value={this.state.logEntry.title}
                    onChange={event => this.onTitleUpdate(event.target.value)}
                />
            </InputGroup>
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
