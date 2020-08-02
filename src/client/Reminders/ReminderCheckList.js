import { MdEdit } from 'react-icons/md';
import assert from 'assert';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import {
    Coordinator, Highlightable, Icon, InputLine, SidebarSection, TextEditor,
} from '../Common';
import DateUtils from '../../common/DateUtils';
import { LogEvent } from '../../data';
import { LogEventEditor } from '../LogEvent';
import PropTypes from '../prop-types';

class ReminderCheckList extends React.Component {
    static getLogEventFromItem(item) {
        if (item.__type__ === 'log-structure') {
            const logStructure = item;
            return LogEvent.createVirtual({ date: DateUtils.getTodayLabel(), logStructure });
        }
        assert(item.__type__ === 'log-event');
        return { ...item, date: DateUtils.getTodayLabel(), isComplete: true };
    }

    constructor(props) {
        super(props);
        this.state = { isItemHighlighted: {} };
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
            if (logStructure.needsEdit && !wasLogEventProvided) {
                this.displayLogEventEditorModal(item, logEvent);
                return;
            }
        }
        window.api.send('reminder-complete', { logStructure, logEvent })
            .then((result) => {
                if (this.closeModal) {
                    this.closeModal();
                    delete this.closeModal;
                }
                Coordinator.invoke('log-event-created', result.logEvent);
            });
    }

    // eslint-disable-next-line class-methods-use-this
    onDismissReminder(item) {
        if (item.__type__ !== 'log-structure') {
            Coordinator.invoke('modal-error', 'Can only dismiss periodic reminders!');
            return;
        }
        window.api.send('reminder-dismiss', { logStructure: item });
    }

    displayLogEventEditorModal(item, logEvent) {
        this.closeModal = Coordinator.invoke('modal-editor', {
            dataType: 'log-event',
            EditorComponent: LogEventEditor,
            valueKey: 'logEvent',
            value: logEvent,
            onSave: (updatedLogEvent) => this.onCompleteReminder(item, updatedLogEvent),
        });
    }

    updateHighlight(item, isHighlighted) {
        this.setState((state) => {
            state.isItemHighlighted[item.id] = isHighlighted;
            return state;
        });
    }

    renderItemSuffix(item) {
        if (!this.state.isItemHighlighted[item.id]) {
            return null;
        }
        return (
            <Icon
                className="ml-1"
                title="Edit"
                onClick={(event) => {
                    this.onEditButtonClick(item);
                }}
            >
                <MdEdit />
            </Icon>
        );
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
            <Highlightable
                key={item.id}
                isHighlighted={this.state.isItemHighlighted[item.id] || false}
                onChange={(isHighlighted) => this.updateHighlight(item, isHighlighted)}
            >
                <InputGroup>
                    <Form.Check
                        type="checkbox"
                        inline
                        checked={false}
                        readOnly
                        onClick={(event) => {
                            if (event.shiftKey) {
                                this.onDismissReminder(item);
                            } else {
                                this.onCompleteReminder(item);
                            }
                        }}
                        style={{ marginRight: 'none' }}
                        tabIndex={-1}
                    />
                    <InputLine styled={false}>
                        {title}
                    </InputLine>
                    {this.renderItemSuffix(item)}
                </InputGroup>
            </Highlightable>
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
