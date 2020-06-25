import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { DatePicker, Select } from '../Common';
import { LogReminder } from '../../data';
import PropTypes from '../prop-types';

const LogReminderType = LogReminder.Type;

class LogEntryReminderEditor extends React.Component {
    static getDerivedStateFromProps(props, state) {
        const { logReminder } = props;
        if (logReminder && !(logReminder.type in state.saved)) {
            state.saved[logReminder.type] = logReminder;
        }
        return state;
    }

    constructor(props) {
        super(props);
        this.state = {
            options: LogReminder.getTypeOptions(),
            saved: {},
        };
    }

    onTypeUpdate(newType) {
        if (newType === LogReminderType.NONE) {
            this.props.onChange(null);
        } else if (newType in this.state.saved) {
            this.props.onChange(this.state.saved[newType]);
        } else {
            const selectedOption = this.state.options.find((option) => option.value === newType);
            this.props.onChange({ ...selectedOption.default });
        }
    }

    getType() {
        return this.props.logReminder ? this.props.logReminder.type : LogReminderType.NONE;
    }

    renderTypeSelector() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Reminder Type
                </InputGroup.Text>
                <Select
                    value={this.getType()}
                    options={this.state.options}
                    onChange={(newType) => this.onTypeUpdate(newType)}
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
        return (
            <>
                {this.renderTypeSelector()}
                {this.getType() === LogReminderType.DEADLINE ? this.renderDeadline() : null}
                {this.getType() === LogReminderType.PERIODIC ? this.renderPeriodic() : null}
            </>
        );
    }
}

LogEntryReminderEditor.propTypes = {
    logReminder: PropTypes.Custom.LogReminder,
    onChange: PropTypes.func.isRequired,
};

export default LogEntryReminderEditor;
