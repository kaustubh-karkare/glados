import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import React from 'react';
import { TiMinus, TiPlus } from 'react-icons/ti';
import { LogEntry } from '../../data';
import LogEntryAdder from './LogEntryAdder';
import LogEntryEditor from './LogEntryEditor';
import LogEntryViewer from './LogEntryViewer';


class LogEntryList extends React.Component {
    static getDerivedStateFromProps(props, state) {
        if (state.logEntries) {
            state.areAllExpanded = state.logEntries
                .every((logEntry) => state.isExpanded[logEntry.id]);
        }
        return state;
    }

    static renderButton(label, method) {
        return (
            <Button
                onClick={method}
                size="sm"
                variant="secondary"
            >
                Save
            </Button>
        );
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        window.api.send('log-entry-list')
            .then((logEntries) => {
                this.setState((state) => ({
                    logEntries,
                    isExpanded: state.isExpanded || {},
                }));
            });
    }

    editLogEntry(logEntry) {
        this.setState({ editLogEntry: logEntry });
    }

    saveLogEntry(logEntry) {
        window.api.send('log-entry-upsert', logEntry)
            .then((savedLogEntry) => {
                this.setState((state) => {
                    if (logEntry.id < 0) {
                        state.logEntries.push(savedLogEntry);
                        if (state.areAllExpanded) {
                            state.isExpanded[savedLogEntry.id] = true;
                        }
                    } else {
                        const index = state.logEntries
                            .findIndex((item) => item.id === logEntry.id);
                        state.logEntries[index] = savedLogEntry;
                    }
                    state.editLogEntry = null;
                    return state;
                });
            });
    }

    deleteLogEntry(logEntry) {
        window.api.send('log-entry-delete', logEntry)
            .then(() => this.reload());
    }

    renderEditorModal() {
        if (!this.state.editLogEntry) {
            return null;
        }
        return (
            <Modal
                show
                size="lg"
                onHide={() => this.setState({ editLogEntry: null })}
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Log Entry Editor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LogEntryEditor
                        logEntry={this.state.editLogEntry}
                        onUpdate={(logEntry) => {
                            LogEntry.trigger(logEntry);
                            this.setState({ editLogEntry: logEntry });
                        }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    {LogEntryList.renderButton('Save', () => this.saveLogEntry(this.state.editLogEntry))}
                </Modal.Footer>
            </Modal>
        );
    }

    renderareAllExpanded() {
        if (this.state.areAllExpanded) {
            return (
                <div
                    className="icon"
                    onClick={() => this.setState({ isExpanded: {} })}
                >
                    <TiMinus />
                </div>
            );
        }
        return (
            <div
                className="icon"
                onClick={() => this.setState((state) => ({
                    isExpanded: Object.fromEntries(
                        state.logEntries.map((logEntry) => [logEntry.id, true]),
                    ),
                }))}
            >
                <TiPlus />
            </div>
        );
    }

    render() {
        if (!this.state.logEntries) {
            return <div>Loading Log Entries ...</div>;
        }
        return (
            <div>
                {this.renderEditorModal()}
                <InputGroup className="mt-2">
                    <div className="mr-1">
                        2020-06-21 (Sunday)
                    </div>
                    {this.renderareAllExpanded()}
                </InputGroup>
                {this.state.logEntries.map((logEntry) => (
                    <LogEntryViewer
                        key={logEntry.id}
                        logEntry={logEntry}
                        isExpanded={this.state.isExpanded[logEntry.id]}
                        onToggleExpansion={() => {
                            this.setState((state) => {
                                state.isExpanded[logEntry.id] = !state.isExpanded[logEntry.id];
                                return state;
                            });
                        }}
                        onEditButtonClick={() => this.editLogEntry(logEntry)}
                        onDeleteButtonClick={() => this.deleteLogEntry(logEntry)}
                    />
                ))}
                <LogEntryAdder
                    onEdit={(logEntry) => this.editLogEntry(logEntry)}
                    onSave={(logEntry) => this.saveLogEntry(logEntry)}
                />
            </div>
        );
    }
}

export default LogEntryList;
