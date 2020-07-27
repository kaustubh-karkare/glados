import React from 'react';
import assert from 'assert';
import {
    Coordinator, EditorModal, SidebarSection, TextEditor,
} from '../Common';
import { getTodayLabel } from '../../common/DateUtils';
import { LogEvent } from '../../data';
import { LogEventEditor } from '../LogEvent';
import CheckListItem from './CheckListItem';
import PropTypes from '../prop-types';

class ReminderCheckList extends React.Component {
    static getLogEventFromItem(item) {
        if (item.__type__ === 'log-structure') {
            const logStructure = item;
            return LogEvent.createVirtual({ date: getTodayLabel(), logStructure });
        }
        assert(item.__type__ === 'log-event');
        return { ...item, date: getTodayLabel(), isComplete: true };
    }

    onEditButtonClick(item) {
        const logEvent = ReminderCheckList.getLogEventFromItem(item);
        this.displayLogEventEditorModal(item, logEvent);
    }

    onCompleteReminder(item, logEvent = null) {
        const wasLogEventProvided = !!logEvent;
        if (!logEvent) {
            logEvent = ReminderCheckList.getLogEventFromItem(item);
        }
        let logStructure;
        if (item.__type__ === 'log-structure') {
            logStructure = item;
            logStructure.lastUpdate = getTodayLabel();
            if (logStructure.needsEdit && !wasLogEventProvided) {
                this.displayLogEventEditorModal(item, logEvent);
                return;
            }
        }
        window.api.send('reminder-complete', { logStructure, logEvent })
            .then(() => {
                if (this.closeModal) {
                    this.closeModal();
                    delete this.closeModal;
                }
                Coordinator.invoke('event-created', logEvent);
            });
    }

    // eslint-disable-next-line class-methods-use-this
    onDismissReminder(item) {
        if (item.__type__ !== 'log-structure') {
            Coordinator.invoke('modal-error', 'Can only dismiss periodic reminders!');
            return;
        }
        const logStructure = item;
        logStructure.lastUpdate = getTodayLabel();
        window.api.send('reminder-dismiss', { logStructure });
    }

    displayLogEventEditorModal(item, logEvent) {
        this.closeModal = Coordinator.invoke('modal', EditorModal, {
            dataType: 'log-event',
            EditorComponent: LogEventEditor,
            valueKey: 'logEvent',
            value: logEvent,
            onSave: (updatedLogEvent) => this.onCompleteReminder(item, updatedLogEvent),
        });
    }

    renderItem(item) {
        let title;
        if (item.__type__ === 'log-structure') {
            title = item.reminderText || item.logTopic.name;
        } else {
            title = (
                <TextEditor
                    unstyled
                    disabled
                    value={item.title}
                />
            );
        }
        return (
            <CheckListItem
                key={item.id}
                onCheckboxClick={(event) => {
                    if (event.shiftKey) {
                        this.onDismissReminder(item);
                    } else {
                        this.onCompleteReminder(item);
                    }
                }}
                onEditButtonClick={(event) => {
                    this.onEditButtonClick(item);
                }}
            >
                {title}
            </CheckListItem>
        );
    }

    renderContent() {
        if (this.props.items.length === 0) {
            return <div className="ml-3">All done for now!</div>;
        }
        return this.props.items.map((item) => this.renderItem(item));
    }

    render() {
        return (
            <SidebarSection title={this.props.name}>
                {this.renderContent()}
            </SidebarSection>
        );
    }
}

ReminderCheckList.propTypes = {
    name: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.any.isRequired).isRequired,
};

export default ReminderCheckList;
