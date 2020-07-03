import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import {
    AsyncSelect, DatePicker, ManagementSelector, Select, TextEditor,
} from '../Common';
import { LogReminder, LogStructure } from '../../data';
import { LogStructureEditor } from '../LogStructure';
import PropTypes from '../prop-types';

class LogReminderEditor extends React.Component {
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
                    serverSideTypes={['log-topic']}
                />
            </InputGroup>
        );
    }

    renderGroupSelector() {
        const { logReminder } = this.props;
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Reminder
                </InputGroup.Text>
                <AsyncSelect
                    dataType="log-reminder-group"
                    value={logReminder.logReminderGroup}
                    onChange={(newLogReminderGroup) => this.props.onChange({
                        ...logReminder,
                        logReminderGroup: newLogReminderGroup,
                    })}
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
        const { logReminder } = this.props;
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Needs Edit?
                    </InputGroup.Text>
                    <Select.Binary
                        value={logReminder.needsEdit}
                        onChange={(newValue) => this.props.onChange({
                            ...this.props.logReminder,
                            needsEdit: newValue,
                        })}
                    />
                </InputGroup>
            </>
        );
    }

    renderStructureManagementSelector() {
        const { logReminder } = this.props;
        return (
            <ManagementSelector
                label="Structure?"
                value={logReminder.logStructure}
                create={() => LogStructure.createVirtual()}
                onChange={(updatedLogStructure) => {
                    const updatedLogReminder = { ...logReminder };
                    updatedLogReminder.logStructure = updatedLogStructure;
                    this.props.onChange(updatedLogReminder);
                }}
                dataType="log-structure"
                valueKey="logStructure"
                EditorComponent={LogStructureEditor}
            />
        );
    }

    render() {
        const { type } = this.props.logReminder.logReminderGroup;
        return (
            <>
                <div className="my-3">
                    {this.renderTitle()}
                </div>
                <div className="my-3">
                    {this.renderGroupSelector()}
                    {type === LogReminder.Type.DEADLINE ? this.renderDeadline() : null}
                    {type === LogReminder.Type.PERIODIC ? this.renderPeriodic() : null}
                    {this.renderNeedsEditSelector()}
                </div>
                <div className="my-3">
                    {this.renderStructureManagementSelector()}
                </div>
            </>
        );
    }
}

LogReminderEditor.propTypes = {
    logReminder: PropTypes.Custom.LogReminder.isRequired,
    onChange: PropTypes.func.isRequired,
    onSpecialKeys: PropTypes.func,
};

export default LogReminderEditor;
