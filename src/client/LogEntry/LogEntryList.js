import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import React from 'react';
import { LogEntry } from '../../data';
import LogEntryEditor from './LogEntryEditor';
import LogEntryViewer from './LogEntryViewer';


class LogEntryList extends React.Component {
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
        this.state = { entries: null };
    }

    componentDidMount() {
        this.reset();
        this.reload();
    }

    reset() {
        this.setState({
            editLogEntry: null,
            newLogEntry: LogEntry.createEmpty(),
        });
    }

    reload() {
        window.api.send('log-entry-list')
            .then((entries) => this.setState({ entries }));
    }

    saveLogEntry(logEntry) {
        window.api.send('log-entry-upsert', logEntry)
            .then(() => {
                this.reset();
                this.reload();
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

    render() {
        if (this.state.entries === null) {
            return <div>Loading Entries ...</div>;
        }
        return (
            <div>
                {this.renderEditorModal()}
                2020-06-21 (Sunday)
                {this.state.entries.map((logEntry) => (
                    <LogEntryViewer
                        key={logEntry.id}
                        logEntry={logEntry}
                        onEditButtonClick={() => this.setState({ editLogEntry: logEntry })}
                        onDeleteButtonClick={() => this.deleteLogEntry(logEntry)}
                    />
                ))}
                <LogEntryEditor
                    logEntry={this.state.newLogEntry}
                    onUpdate={(logEntry) => {
                        LogEntry.trigger(logEntry);
                        this.setState({ newLogEntry: logEntry });
                    }}
                />
                {LogEntryList.renderButton('Save', () => this.saveLogEntry(this.state.newLogEntry))}
            </div>
        );
    }
}

export default LogEntryList;
