import React from 'react';
import { DataLoader, EditorModal, TextEditor } from '../Common';
import { getTodayLabel } from '../../common/DateUtils';
import { LogEvent, LogReminder } from '../../data';
import { LogEventEditor } from '../LogEvent';
import CheckListItem from './CheckListItem';
import PropTypes from '../prop-types';

class LogReminderCheckList extends React.Component {
    static createLogEventFromReminder(logReminder) {
        const logEvent = LogEvent.createVirtual({
            date: getTodayLabel(),
            logStructure: logReminder.logStructure,
        });
        LogEvent.trigger(logEvent);
        if (!logEvent.title) {
            logEvent.title = logReminder.title;
        }
        return logEvent;
    }

    constructor(props) {
        super(props);
        this.state = { logReminders: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            name: 'log-reminder-list',
            args: {
                selector: { group_id: this.props.logReminderGroup.id },
                ordering: true,
                isActive: true,
            },
            callback: (logReminders) => this.setState({ logReminders }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    onEditButtonClick(logReminder) {
        const logEvent = LogReminderCheckList.createLogEventFromReminder(logReminder);
        this.displayEditorModal(logReminder, logEvent);
    }

    onCompleteReminder(logReminder, logEvent = null) {
        let wasLogEventProvided = false;
        if (logEvent) {
            wasLogEventProvided = true;
        } else {
            logEvent = LogReminderCheckList.createLogEventFromReminder(logReminder);
        }
        if (logReminder.needsEdit && !wasLogEventProvided) {
            this.displayEditorModal(logReminder, logEvent);
            return;
        }
        window.api.send('reminder-complete', { logReminder, logEvent })
            .then(() => {
                // Assuming no update needed ...
                this.setState((state) => {
                    state.logReminders = state.logReminders.filter(
                        (item) => item.id !== logReminder.id,
                    );
                    return state;
                });
                if (this.closeModal) {
                    this.closeModal();
                    delete this.closeModal;
                }
            })
            .catch((error) => window.modalStack_displayError(error));
    }

    // eslint-disable-next-line class-methods-use-this
    onDismissReminder(logReminder) {
        if (logReminder.type !== LogReminder.Type.PERIODIC) {
            window.modalStack_displayError('Can only dismiss periodic reminders!');
            return;
        }
        logReminder.lastUpdate = getTodayLabel();
        window.api.send('log-reminder-upsert', logReminder)
            .catch((error) => window.modalStack_displayError(error));
    }

    displayEditorModal(logReminder, logEvent) {
        this.closeModal = window.modalStack_push(EditorModal, {
            dataType: 'log-event',
            EditorComponent: LogEventEditor,
            valueKey: 'logEvent',
            value: logEvent,
            onSave: (updatedLogEvent) => this.onCompleteReminder(logReminder, updatedLogEvent),
        });
    }

    renderItem(logReminder) {
        return (
            <CheckListItem
                key={logReminder.id}
                onCheckboxClick={(event) => {
                    if (event.shiftKey) {
                        this.onDismissReminder(logReminder);
                    } else {
                        this.onCompleteReminder(logReminder);
                    }
                }}
                onEditButtonClick={(event) => {
                    this.onEditButtonClick(logReminder);
                }}
            >
                <TextEditor
                    unstyled
                    disabled
                    value={logReminder.title}
                />
            </CheckListItem>
        );
    }

    renderContent() {
        if (this.state.logReminders === null) {
            return 'Loading ...';
        } if (this.state.logReminders.length === 0) {
            return <div className="ml-3">All done for now!</div>;
        }
        return this.state.logReminders.map((logReminder) => this.renderItem(logReminder));
    }

    render() {
        return (
            <div>
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
