import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import DateUtils from '../../common/DateUtils';
import {
    DatePicker, Selector, TextInput,
} from '../Common';
import { LogStructure } from '../../data';

const MonthOptions = DateUtils.MonthsOfTheYear.map((month, index) => {
    const value = `0${index + 1}`.substr(-2);
    return { label: `${month.name} (${value})`, value };
});

const DayOptions = Array(Math.max(...DateUtils.MonthsOfTheYear.map((month) => month.days)))
    .fill(null)
    .map((_, index) => {
        const value = `0${index + 1}`.substr(-2);
        return { label: value, value };
    });

const WarningDayOptions = Array(15).fill(null).map((_, index) => {
    const value = `${index}`;
    return { label: value, value };
});

class LogStructureFrequencyEditor extends React.Component {
    updateIsPeriodic(newIsPeriodic) {
        this.props.updateLogStructure((updatedLogStructure) => {
            if (newIsPeriodic) {
                updatedLogStructure.isPeriodic = true;
                updatedLogStructure.reminderText = updatedLogStructure._reminderText || '';
                updatedLogStructure.frequency = (
                    updatedLogStructure._frequency || LogStructure.Frequency.EVERYDAY
                );
                updatedLogStructure.warningDays = updatedLogStructure._warningDays || 0;
                updatedLogStructure.suppressUntilDate = updatedLogStructure._suppressUntilDate || '{yesterday}';
                DateUtils.maybeSubstitute(updatedLogStructure, 'suppressUntilDate');
            } else {
                updatedLogStructure.isPeriodic = false;
                updatedLogStructure._reminderText = updatedLogStructure.reminderText;
                updatedLogStructure.reminderText = null;
                updatedLogStructure._frequency = updatedLogStructure.frequency;
                updatedLogStructure.frequency = null;
                updatedLogStructure._warningDays = updatedLogStructure.warningDays;
                updatedLogStructure.warningDays = null;
                updatedLogStructure._suppressUntilDate = updatedLogStructure.suppressUntilDate;
                updatedLogStructure.suppressUntilDate = null;
            }
        });
    }

    updateFrequency(newFrequency) {
        this.props.updateLogStructure((updatedLogStructure) => {
            const oldFrequency = updatedLogStructure.frequency;
            updatedLogStructure.frequency = newFrequency;
            if (newFrequency === LogStructure.Frequency.YEARLY) {
                updatedLogStructure.frequencyArgs = (
                    updatedLogStructure._frequencyArgs || DateUtils.getTodayLabel().substr(5)
                );
            } else if (oldFrequency === LogStructure.Frequency.YEARLY) {
                updatedLogStructure._frequencyArgs = updatedLogStructure.frequencyArgs;
                updatedLogStructure.frequencyArgs = null;
            }
        });
    }

    renderIsPeriodic() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Is Periodic?
                </InputGroup.Text>
                <Selector.Binary
                    value={this.props.logStructure.isPeriodic}
                    disabled={this.props.disabled}
                    onChange={(isPeriodic) => this.updateIsPeriodic(isPeriodic)}
                />
            </InputGroup>
        );
    }

    renderReminderText() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Reminder Text
                </InputGroup.Text>
                <TextInput
                    value={this.props.logStructure.reminderText}
                    disabled={this.props.disabled}
                    onChange={(reminderText) => this.props.updateLogStructure('reminderText', reminderText)}
                />
            </InputGroup>
        );
    }

    renderFrequency() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Frequency
                </InputGroup.Text>
                <Selector
                    value={this.props.logStructure.frequency}
                    options={LogStructure.Frequency.Options}
                    disabled={this.props.disabled}
                    onChange={(frequency) => this.updateFrequency(frequency)}
                />
            </InputGroup>
        );
    }

    renderFrequencyArgs() {
        const { frequency, frequencyArgs } = this.props.logStructure;
        if (frequency !== LogStructure.Frequency.YEARLY) {
            return null;
        }
        const [oldMonth, oldDay] = frequencyArgs.split('-');
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Yearly Date
                </InputGroup.Text>
                <Selector
                    options={MonthOptions}
                    disabled={this.props.disabled}
                    value={oldMonth}
                    onChange={(newMonth) => this.props.updateLogStructure('frequencyArgs', `${newMonth}-${oldDay}`)}
                />
                <Selector
                    options={DayOptions}
                    disabled={this.props.disabled}
                    value={oldDay}
                    onChange={(newDay) => this.props.updateLogStructure('frequencyArgs', `${oldMonth}-${newDay}`)}
                />
            </InputGroup>
        );
    }

    renderWarningDays() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Warning Days
                </InputGroup.Text>
                <Selector
                    options={WarningDayOptions}
                    disabled={this.props.disabled}
                    value={this.props.logStructure.warningDays.toString()}
                    onChange={(warningDays) => this.props.updateLogStructure('warningDays', parseInt(warningDays, 10))}
                />
            </InputGroup>
        );
    }

    renderSuppressUntilDate() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Suppress Until
                </InputGroup.Text>
                <DatePicker
                    date={this.props.logStructure.suppressUntilDate}
                    disabled={this.props.disabled}
                    onChange={(suppressUntilDate) => this.props.updateLogStructure('suppressUntilDate', suppressUntilDate)}
                />
            </InputGroup>
        );
    }

    render() {
        return (
            <>
                {this.renderIsPeriodic()}
                {this.props.logStructure.isPeriodic
                    ? (
                        <>
                            {this.renderReminderText()}
                            {this.renderFrequency()}
                            {this.renderFrequencyArgs()}
                            {this.renderWarningDays()}
                            {this.renderSuppressUntilDate()}
                        </>
                    )
                    : null}
            </>
        );
    }
}

LogStructureFrequencyEditor.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
    disabled: PropTypes.bool.isRequired,
    updateLogStructure: PropTypes.func.isRequired,
};

export default LogStructureFrequencyEditor;
