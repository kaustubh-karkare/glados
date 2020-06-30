import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import {
    AsyncSelect, DatePicker, Select, TextEditor, Typeahead,
} from '../Common';
import { LogReminder, LogStructure } from '../../data';
import PropTypes from '../prop-types';

const NeedsEditOptions = [
    { label: 'No', value: 'no' },
    { label: 'Yes', value: 'yes' },
];

class LogReminderEditor extends React.Component {
    renderGroupSelector() {
        const { logReminderGroup } = this.props.logReminder;
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Reminder
                </InputGroup.Text>
                <AsyncSelect
                    dataType="log-reminder-group"
                    value={logReminderGroup}
                    onChange={(newLogReminderGroup) => this.props.onChange(
                        LogReminder.createVirtual({ logReminderGroup: newLogReminderGroup }),
                    )}
                />
            </InputGroup>
        );
    }

    renderTitle() {
        const { logReminder } = this.props;
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Title
                </InputGroup.Text>
                <TextEditor
                    isSingleLine
                    focusOnLoad
                    value={logReminder.title}
                    onUpdate={(value) => {
                        const updatedLogReminder = { ...logReminder };
                        updatedLogReminder.title = value;
                        this.props.onChange(updatedLogReminder);
                    }}
                    onSpecialKeys={this.props.onSpecialKeys}
                />
            </InputGroup>
        );
    }

    renderStructure() {
        const { logReminder } = this.props;
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Structure
                </InputGroup.Text>
                <Typeahead
                    dataType="log-structure"
                    value={logReminder.logStructure}
                    onUpdate={(updatedLogStructure) => {
                        const updatedLogReminder = { ...logReminder };
                        updatedLogReminder.logStructure = updatedLogStructure;
                        this.props.onChange(updatedLogReminder);
                    }}
                    allowDelete
                    onDelete={() => {
                        const updatedLogReminder = { ...logReminder };
                        updatedLogReminder.logStructure = LogStructure.createVirtual();
                        this.props.onChange(updatedLogReminder);
                    }}
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

    renderNeedsEditSelector() {
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Needs Edit?
                    </InputGroup.Text>
                    <Select
                        value={NeedsEditOptions[this.props.logReminder.needsEdit ? 1 : 0].value}
                        options={NeedsEditOptions}
                        onChange={(newValue) => this.props.onChange({
                            ...this.props.logReminder,
                            needsEdit: newValue === NeedsEditOptions[1].value,
                        })}
                    />
                </InputGroup>
            </>
        );
    }

    render() {
        const { type } = this.props.logReminder.logReminderGroup;
        return (
            <>
                <div className="my-3">
                    {this.renderTitle()}
                    {this.renderStructure()}
                </div>
                <div className="my-3">
                    {this.renderGroupSelector()}
                    {type === LogReminder.Type.DEADLINE ? this.renderDeadline() : null}
                    {type === LogReminder.Type.PERIODIC ? this.renderPeriodic() : null}
                    {this.renderNeedsEditSelector()}
                </div>
            </>
        );
    }
}

LogReminderEditor.propTypes = {
    logReminder: PropTypes.Custom.LogReminder.isRequired,
    onChange: PropTypes.func.isRequired,
    onSpecialKeys: PropTypes.func.isRequired,
};

export default LogReminderEditor;
