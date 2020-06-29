import React from 'react';
import { DataLoader, EditorModal, ErrorModal } from '../Common';
import { getTodayLabel } from '../../common/DateUtils';
import { LogEntryList } from '../LogEntry';
import assert from '../../common/assert';
import PropTypes from '../prop-types';
import CheckListItem from './CheckListItem';

class LogReminderCheckList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logEntries: null, editLogEntry: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            name: 'reminder-list',
            args: {
                selector: { group_id: this.props.logReminderGroup.id },
                logReminderGroup: this.props.logReminderGroup,
            },
            callback: (logEntries) => this.setState({ logEntries }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    onEditButtonClick(logEntry) {
        logEntry = { ...logEntry, date: getTodayLabel() };
        this.setState({ editLogEntry: logEntry });
    }

    onCompleteReminder(logEntry, didEdit) {
        if (logEntry.logReminder.needsEdit && !didEdit) {
            this.onEditButtonClick(logEntry);
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
            <CheckListItem
                key={logEntry.id}
                onCheckboxClick={(event) => this.onCompleteReminder(logEntry, false)}
                onEditButtonClick={() => this.onEditButtonClick(logEntry)}
            >
                <LogEntryList.ViewerComponent value={logEntry} />
            </CheckListItem>
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

LogReminderCheckList.propTypes = {
    logReminderGroup: PropTypes.Custom.LogReminderGroup.isRequired,
};

export default LogReminderCheckList;
