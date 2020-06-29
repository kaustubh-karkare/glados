import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import assert from '../../common/assert';
import PropTypes from '../prop-types';
import { EditorModal, ErrorModal } from '../Common';
import { LogEntryList } from '../LogEntry';
import { getTodayLabel } from '../../common/DateUtils';


class LogReminderList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logEntries: null, editLogEntry: null };
    }

    componentDidMount() {
        this.onLoad();
    }

    onLoad() {
        const { logReminderGroup } = this.props;
        window.api.send('reminder-list', { logReminderGroup })
            .then((logEntries) => this.setState({ logEntries }));
    }

    onCompleteReminder(logEntry, didEdit) {
        if (logEntry.logReminder.needsEdit && !didEdit) {
            logEntry = { ...logEntry, date: getTodayLabel() };
            this.setState({ editLogEntry: logEntry });
            return;
        }
        window.api.send('reminder-complete', { logEntry })
            .then(() => {
                // Assuming no update needed ...
                this.setState((state) => {
                    state.editLogEntry = null;
                    state.logEntries = state.logEntries.filter(
                        (item) => item.id !== logEntry.id,
                    );
                    return state;
                });
            })
            .catch((error) => this.setState({ error }));
    }

    renderItem(logEntry) {
        assert(logEntry.logReminder);
        return (
            <InputGroup key={logEntry.id}>
                <Form.Check
                    type="checkbox"
                    inline
                    checked={false}
                    onChange={(event) => this.onCompleteReminder(logEntry, false)}
                    style={{ marginRight: 'none' }}
                />
                <LogEntryList.ViewerComponent value={logEntry} />
            </InputGroup>
        );
    }

    renderContent() {
        if (this.state.logEntries === null) {
            return 'Loading ...';
        } if (this.state.logEntries.length === 0) {
            return <div className="ml-3">All done!</div>;
        }
        return this.state.logEntries.map((logEntry) => this.renderItem(logEntry));
    }

    render() {
        return (
            <div>
                <EditorModal
                    dataType="log-entry"
                    EditorComponent={LogEntryList.EditorComponent}
                    editorProps={{ hideReminderSection: true }}
                    value={this.state.editLogEntry}
                    onChange={(editLogEntry) => this.setState({ editLogEntry })}
                    onSave={() => this.onCompleteReminder(this.state.editLogEntry, true)}
                    onError={(error) => this.setState({ error })}
                />
                <ErrorModal
                    error={this.state.error}
                    onClose={() => this.setState({ error: null })}
                />
                <div className="log-viewer">
                    <span>{this.props.logReminderGroup.name}</span>
                </div>
                {this.renderContent()}
            </div>
        );
    }
}

LogReminderList.propTypes = {
    logReminderGroup: PropTypes.Custom.LogReminderGroup.isRequired,
};


export default LogReminderList;
