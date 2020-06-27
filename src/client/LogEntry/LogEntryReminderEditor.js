import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import {
    AsyncSelect, DatePicker, Select,
} from '../Common';
import { LogReminder, LogReminderGroup, getVirtualID } from '../../data';
import PropTypes from '../prop-types';

const LogReminderType = LogReminder.Type;

const NoneOption = {
    id: getVirtualID(),
    name: 'None',
};

class LogEntryReminderEditor extends React.Component {
    renderGroupSelector() {
        const logReminderGroup = this.props.logReminder
            ? this.props.logReminder.logReminderGroup
            : LogReminderGroup.createVirtual();
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Reminder
                </InputGroup.Text>
                <AsyncSelect
                    dataType="log-reminder-group"
                    prefixOptions={[NoneOption]}
                    value={logReminderGroup}
                    onChange={(newLogReminderGroup) => this.props.onChange(
                        newLogReminderGroup.id === NoneOption.id
                            ? null
                            : LogReminder.getVirtual({ logReminderGroup: newLogReminderGroup }),
                    )}
                />
            </InputGroup>
        );
    }

    renderDeadline() {
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Deadline
                    </InputGroup.Text>
                    <DatePicker
                        value={this.props.logReminder.deadline}
                        onChange={(newDeadline) => this.props.onChange({
                            ...this.props.logReminder,
                            deadline: newDeadline,
                        })}
                    />
                </InputGroup>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Warning
                    </InputGroup.Text>
                    <Select
                        value={this.props.logReminder.warning}
                        options={LogReminder.getDurationOptions()}
                        onChange={(newWarning) => this.props.onChange({
                            ...this.props.logReminder,
                            warning: newWarning,
                        })}
                    />
                </InputGroup>
            </>
        );
    }

    renderPeriodic() {
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Frequency
                    </InputGroup.Text>
                    <Select
                        value={this.props.logReminder.frequency}
                        options={LogReminder.getFrequencyOptions()}
                        onChange={(newFrequency) => this.props.onChange({
                            ...this.props.logReminder,
                            frequency: newFrequency,
                        })}
                    />
                </InputGroup>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Last Update
                    </InputGroup.Text>
                    <DatePicker
                        value={this.props.logReminder.lastUpdate}
                        onChange={(newLastUpdate) => this.props.onChange({
                            ...this.props.logReminder,
                            lastUpdate: newLastUpdate,
                        })}
                    />
                </InputGroup>
            </>
        );
    }

    render() {
        const type = this.props.logReminder
            ? this.props.logReminder.logReminderGroup.type
            : LogReminderType.NONE;
        return (
            <>
                {this.renderGroupSelector()}
                {type === LogReminderType.DEADLINE ? this.renderDeadline() : null}
                {type === LogReminderType.PERIODIC ? this.renderPeriodic() : null}
            </>
        );
    }
}

LogEntryReminderEditor.propTypes = {
    logReminder: PropTypes.Custom.LogReminder,
    onChange: PropTypes.func.isRequired,
};

export default LogEntryReminderEditor;
