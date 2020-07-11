import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import {
    DatePicker, ManagementSelector, Selector, TextEditor,
} from '../Common';
import { LogReminder, LogStructure } from '../../data';
import { LogStructureEditor } from '../LogStructure';
import PropTypes from '../prop-types';

class LogReminderEditor extends React.Component {
    updateLogEvent(name, value) {
        const logReminder = { ...this.props.logReminder };
        logReminder[name] = value;
        LogReminder.trigger(logReminder);
        this.props.onChange(logReminder);
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
                    disabled={this.props.disabled || !!logReminder.logStructure}
                    onChange={(title) => this.updateLogEvent('title', title)}
                    onSpecialKeys={this.props.onSpecialKeys}
                    serverSideTypes={['log-topic']}
                />
            </InputGroup>
        );
    }

    renderTypeSelector() {
        const { logReminder } = this.props;
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Type
                </InputGroup.Text>
                <Selector
                    value={logReminder.type}
                    options={LogReminder.ReminderOptions}
                    disabled={this.props.disabled}
                    onChange={(type) => this.updateLogEvent('type', type)}
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
                        disabled={this.props.disabled}
                        onChange={(deadline) => this.updateLogEvent('deadline', deadline)}
                    />
                </InputGroup>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Warning
                    </InputGroup.Text>
                    <Selector
                        value={this.props.logReminder.warning}
                        options={LogReminder.DurationOptions}
                        disabled={this.props.disabled}
                        onChange={(warning) => this.updateLogEvent('warning', warning)}
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
                    <Selector
                        value={this.props.logReminder.frequency}
                        options={LogReminder.FrequencyOptions}
                        disabled={this.props.disabled}
                        onChange={(frequency) => this.updateLogEvent('frequency', frequency)}
                    />
                </InputGroup>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Last Update
                    </InputGroup.Text>
                    <DatePicker
                        value={this.props.logReminder.lastUpdate}
                        disabled={this.props.disabled}
                        onChange={(lastUpdate) => this.updateLogEvent('lastUpdate', lastUpdate)}
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
                    <Selector.Binary
                        value={logReminder.needsEdit}
                        disabled={this.props.disabled}
                        onChange={(needsEdit) => this.updateLogEvent('needsEdit', needsEdit)}
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
                disabled={this.props.disabled}
                onChange={(logStructure) => this.updateLogEvent('logStructure', logStructure)}
                dataType="log-structure"
                valueKey="logStructure"
                EditorComponent={LogStructureEditor}
            />
        );
    }

    render() {
        const { type } = this.props.logReminder;
        return (
            <>
                <div className="my-3">
                    {this.renderTitle()}
                </div>
                <div className="my-3">
                    {this.renderTypeSelector()}
                    {type === LogReminder.ReminderType.DEADLINE ? this.renderDeadline() : null}
                    {type === LogReminder.ReminderType.PERIODIC ? this.renderPeriodic() : null}
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
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSpecialKeys: PropTypes.func,
};

export default LogReminderEditor;
