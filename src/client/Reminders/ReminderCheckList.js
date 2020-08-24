import { MdEdit } from 'react-icons/md';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from 'prop-types';
import {
    Coordinator, Highlightable, Icon, InputLine, SidebarSection,
} from '../Common';
import DateUtils from '../../common/DateUtils';
import { LogEvent } from '../../data';
import { LogEventEditor } from '../LogEvent';
import { LogStructureEditor } from '../LogStructure';

class ReminderCheckList extends React.Component {
    static getLogEventFromStructure(logStructure) {
        return LogEvent.createVirtual({ date: DateUtils.getTodayLabel(), logStructure });
    }

    constructor(props) {
        super(props);
        this.state = { isHighlighted: {} };
    }

    onEditButtonClick(event, logStructure) {
        if (event.shiftKey) {
            this.displayLogStructureEditorModal(logStructure);
            return;
        }
        const logEvent = ReminderCheckList.getLogEventFromStructure(logStructure);
        this.displayLogEventEditorModal(logStructure, logEvent);
    }

    onCompleteReminder(logStructure, logEvent = null) {
        const wasLogEventProvided = !!logEvent;
        if (!logEvent) {
            logEvent = ReminderCheckList.getLogEventFromStructure(logStructure);
        }
        if (logStructure.needsEdit && !wasLogEventProvided) {
            this.displayLogEventEditorModal(logStructure, logEvent);
            return;
        }
        window.api.send('reminder-complete', { logStructure, logEvent })
            .then((result) => {
                if (this.closeModal) {
                    this.closeModal();
                    delete this.closeModal;
                }
                Coordinator.broadcast('log-event-created', result.logEvent);
            });
    }

    // eslint-disable-next-line class-methods-use-this
    onDismissReminder(logStructure) {
        window.api.send('reminder-dismiss', { logStructure });
    }

    displayLogEventEditorModal(logStructure, logEvent) {
        this.closeModal = Coordinator.invoke('modal-editor', {
            dataType: 'log-event',
            EditorComponent: LogEventEditor,
            valueKey: 'logEvent',
            value: logEvent,
            onSave: (updatedLogEvent) => this.onCompleteReminder(logStructure, updatedLogEvent),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    displayLogStructureEditorModal(logStructure) {
        Coordinator.invoke('modal-editor', {
            dataType: 'log-structure',
            EditorComponent: LogStructureEditor,
            valueKey: 'logStructure',
            value: logStructure,
        });
    }

    updateHighlight(logStructure, isHighlighted) {
        this.setState((state) => {
            state.isHighlighted[logStructure.id] = isHighlighted;
            return state;
        });
    }

    renderSuffix(logStructure) {
        if (!this.state.isHighlighted[logStructure.id]) {
            return null;
        }
        return (
            <Icon
                className="ml-1"
                title="Edit"
                onClick={(event) => this.onEditButtonClick(event, logStructure)}
            >
                <MdEdit />
            </Icon>
        );
    }

    renderRow(logStructure) {
        let tooltip = (logStructure.reminderScore.deadline ? `Deadline: ${logStructure.reminderScore.deadline}\n\n` : '');
        tooltip += logStructure.reminderScore.dateRanges.join('\n');
        const title = (
            <span>
                {logStructure.reminderText || logStructure.name}
                <span style={{ float: 'right' }} title={tooltip}>
                    {logStructure.reminderScore.value}
                </span>
            </span>
        );
        return (
            <Highlightable
                key={logStructure.id}
                isHighlighted={this.state.isHighlighted[logStructure.id] || false}
                onChange={(isHighlighted) => this.updateHighlight(logStructure, isHighlighted)}
            >
                <InputGroup>
                    <Form.Check
                        type="checkbox"
                        inline
                        checked={false}
                        readOnly
                        onClick={(event) => {
                            if (event.shiftKey) {
                                this.onDismissReminder(logStructure);
                            } else {
                                this.onCompleteReminder(logStructure);
                            }
                        }}
                        style={{ marginRight: 'none' }}
                        tabIndex={-1}
                    />
                    <InputLine styled={false}>
                        {title}
                    </InputLine>
                    {this.renderSuffix(logStructure)}
                </InputGroup>
            </Highlightable>
        );
    }

    renderContent() {
        if (this.props.logStructures.length === 0) {
            return <div className="ml-3">All done for now!</div>;
        }
        return this.props.logStructures.map((logStructure) => this.renderRow(logStructure));
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
    logStructures: PropTypes.arrayOf(PropTypes.Custom.LogStructure.isRequired).isRequired,
};

export default ReminderCheckList;
