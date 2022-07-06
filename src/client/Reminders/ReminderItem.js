import PropTypes from 'prop-types';
import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { BsList } from 'react-icons/bs';

import { LogEvent } from '../../common/data_types';
import {
    Coordinator, DateContext, Dropdown, Highlightable, Icon, InputLine,
} from '../Common';
import { LogEventEditor } from '../LogEvent';
import { LogStructureEditor } from '../LogStructure';

class ReminderItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isHighlighted: false };
        this.dropdownRef = React.createRef();
    }

    onEditButtonClick() {
        Coordinator.invoke('modal-editor', {
            dataType: 'log-structure',
            EditorComponent: LogStructureEditor,
            valueKey: 'logStructure',
            value: this.props.logStructure,
        });
    }

    onCompleteReminder(logEvent = null) {
        const { todayLabel } = this.context;
        const { logStructure } = this.props;
        const wasLogEventProvided = !!logEvent;
        if (!logEvent) {
            logEvent = LogEvent.createVirtual({ date: todayLabel, logStructure });
        }
        if (logStructure.eventNeedsEdit && !wasLogEventProvided) {
            // This modal is only closed after the reminder-complete RPC.
            this.closeModal = Coordinator.invoke('modal-editor', {
                dataType: 'log-event',
                EditorComponent: LogEventEditor,
                valueKey: 'logEvent',
                value: logEvent,
                onSave: (updatedLogEvent) => this.onCompleteReminder(updatedLogEvent),
            });
            return;
        }
        window.api.send('reminder-complete', { logStructure, logEvent, todayLabel })
            .then(() => {
                if (this.closeModal) {
                    this.closeModal();
                    delete this.closeModal;
                }
            });
    }

    onDismissReminder() {
        const { todayLabel } = this.context;
        const { logStructure } = this.props;
        window.api.send('reminder-dismiss', { logStructure, todayLabel });
    }

    renderRight() {
        const { logStructure } = this.props;
        if (!this.state.isHighlighted) {
            return (
                <span className="float-right">
                    {logStructure.reminderScore.value}
                </span>
            );
        }
        const actions = [
            {
                __id__: 'done',
                name: 'Mark as Complete',
                perform: (_event) => this.onCompleteReminder(),
            },
            {
                __id__: 'dismiss',
                name: 'Dismiss Reminder',
                perform: (_event) => this.onDismissReminder(),
            },
            {
                __id__: 'edit',
                name: 'Edit Structure',
                perform: (_event) => this.onEditButtonClick(),
            },
            {
                __id__: 'info',
                name: 'Debug Info',
                perform: (_event) => Coordinator.invoke(
                    'modal-error',
                    JSON.stringify(logStructure, null, 4),
                ),
            },
        ];
        return (
            <Icon className="ml-1" title="Actions">
                <Dropdown
                    disabled={false}
                    options={actions}
                    onChange={(action, event) => action.perform(event)}
                    ref={this.dropdownRef}
                >
                    <BsList
                        onMouseOver={() => {
                            if (this.dropdownRef.current) {
                                this.dropdownRef.current.show();
                            }
                        }}
                    />
                </Dropdown>
            </Icon>
        );
    }

    render() {
        const { logStructure } = this.props;
        return (
            <Highlightable
                key={logStructure.__id__}
                isHighlighted={this.state.isHighlighted}
                onChange={(isHighlighted) => this.setState({ isHighlighted })}
            >
                <InputGroup className="reminder-item">
                    <Form.Check
                        type="checkbox"
                        inline
                        checked={false}
                        readOnly
                        onClick={(event) => {
                            if (event.shiftKey) {
                                this.onDismissReminder();
                            } else {
                                this.onCompleteReminder();
                            }
                        }}
                        style={{ marginRight: 'none' }}
                        tabIndex={-1}
                    />
                    <InputLine styled={false}>
                        {logStructure.reminderText || logStructure.name}
                    </InputLine>
                    {this.renderRight()}
                </InputGroup>
            </Highlightable>
        );
    }
}

ReminderItem.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
};

ReminderItem.contextType = DateContext;

export default ReminderItem;
