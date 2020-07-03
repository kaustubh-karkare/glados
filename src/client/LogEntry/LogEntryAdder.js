import PropTypes from 'prop-types';
import React from 'react';
import { LogEntry, LogReminder, isRealItem } from '../../data';
import LogEntryEditor from './LogEntryEditor';
import { EditorModal, KeyCodes, TextEditor } from '../Common';
import { LogReminderEditor } from '../LogReminder';

class LogEntryAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEntry: LogEntry.createVirtual(this.props.selector),
        };
    }

    onEditLogEntry(logEntry) {
        this.setState({ logEntry: LogEntry.createVirtual(this.props.selector) });
        window.modalStack_push(EditorModal, {
            dataType: 'log-entry',
            EditorComponent: LogEntryEditor,
            valueKey: 'logEntry',
            value: logEntry,
            closeOnSave: true,
        });
    }

    onSaveLogEntry(logEntry) {
        if (logEntry.name) {
            window.api.send('log-entry-upsert', logEntry)
                .then((value) => {
                    this.setState({ logEntry: LogEntry.createVirtual(this.props.selector) });
                })
                .catch((error) => window.modalStack_displayError(error));
        } else {
            this.onEditLogEntry(logEntry);
        }
    }

    onSelectSuggestion(option) {
        if (option.__type__ === 'log-structure') {
            const logStructure = option;
            const updatedLogEntry = LogEntry.createVirtual({
                ...this.props.selector,
                logStructure,
            });
            LogEntry.trigger(updatedLogEntry);
            this.onEditLogEntry(updatedLogEntry);
        } else if (option.__type__ === 'log-reminder-group') {
            const logReminderGroup = option;
            const logReminder = LogReminder.createVirtual({
                logReminderGroup,
                title: this.state.logEntry.title, // TODO: Remove the mention entity!
            });
            this.setState({ logEntry: LogEntry.createVirtual(this.props.selector) });
            window.modalStack_push(EditorModal, {
                dataType: 'log-reminder',
                EditorComponent: LogReminderEditor,
                valueKey: 'logReminder',
                value: logReminder,
                closeOnSave: true,
            });
        }
    }

    render() {
        const { logEntry } = this.state;
        return (
            <TextEditor
                isSingleLine
                focusOnLoad
                unstyled
                placeholder="Add Entry ..."
                value={logEntry.title}
                serverSideTypes={['log-topic', 'log-structure', 'log-reminder-group']}
                disabled={isRealItem(logEntry.logStructure)}
                onUpdate={(value) => {
                    const updatedLogEntry = { ...logEntry };
                    updatedLogEntry.title = value;
                    LogEntry.trigger(updatedLogEntry);
                    this.setState({ logEntry: updatedLogEntry });
                }}
                onSpecialKeys={(event) => {
                    if (event.keyCode === KeyCodes.ENTER) {
                        this.onSaveLogEntry(logEntry);
                    }
                }}
                onSelectSuggestion={(option) => this.onSelectSuggestion(option)}
                {...this.props}
            />
        );
    }
}

LogEntryAdder.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
};

LogEntryAdder.defaultProps = {
    selector: {},
};

export default LogEntryAdder;
