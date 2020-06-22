import Button from 'react-bootstrap/Button';
import React from 'react';
import { LogEntry } from '../../data';
import LogEntryEditor from './LogEntryEditor';
import LogEntryViewer from './LogEntryViewer';


class LogEntryList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            entries: null,
            newLogEntry: LogEntry.createEmpty(),
        };
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        window.api.send('log-entry-list')
            .then((entries) => this.setState({ entries }));
    }

    saveLogEntry(logEntry) {
        window.api.send('log-entry-upsert', logEntry)
            .then((result) => {
                this.reload();
                this.setState({
                    logEntry: result,
                    newLogEntry: LogEntry.createEmpty(),
                });
            });
    }

    deleteLogEntry(logEntry) {
        window.api.send('log-entry-delete', logEntry)
            .then(() => this.reload());
    }

    renderSaveButton() {
        return (
            <Button
                onClick={() => this.saveLogEntry(this.state.newLogEntry)}
                size="sm"
                variant="secondary"
            >
                Save
            </Button>
        );
    }

    render() {
        if (this.state.entries === null) {
            return <div>Loading Entries ...</div>;
        }
        return (
            <div>
                2020-06-21 (Sunday)
                {this.state.entries.map((logEntry) => (
                    <LogEntryViewer
                        key={logEntry.id}
                        logEntry={logEntry}
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
                {this.renderSaveButton()}
            </div>
        );
    }
}

export default LogEntryList;
