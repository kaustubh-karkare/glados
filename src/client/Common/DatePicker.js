import { Calendar } from 'react-date-range';
import PropTypes from 'prop-types';
import React from 'react';
import PopoverElement from './PopoverElement';
import DateUtils from '../../common/date_utils';

// https://github.com/hypeserver/react-date-range
// Note: The corresponding CSS is included from DateRangePicker.

class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastDate: this.props.date || DateUtils.getTodayLabel(),
        };
    }

    render() {
        return (
            <PopoverElement onReset={() => this.props.onChange(null)}>
                {this.props.date || 'Date: Unspecified'}
                <Calendar
                    date={DateUtils.getDate(this.props.date || this.state.lastDate)}
                    onChange={(rawDate) => {
                        const date = DateUtils.getLabel(rawDate);
                        this.setState({ lastDate: date });
                        this.props.onChange(date);
                    }}
                />
            </PopoverElement>
        );
    }
}

DatePicker.propTypes = {
    date: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default DatePicker;
