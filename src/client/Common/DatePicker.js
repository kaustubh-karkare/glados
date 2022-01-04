import PropTypes from 'prop-types';
import React from 'react';
import { Calendar } from 'react-date-range';

import DateUtils from '../../common/DateUtils';
import DateContext from './DateContext';
import PopoverElement from './PopoverElement';

// https://github.com/hypeserver/react-date-range
// Note: The corresponding CSS is included from DateRangePicker.

class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastDate: this.props.date || null,
        };
    }

    render() {
        const { todayLabel } = this.context;
        const lastDate = this.state.lastDate || todayLabel;
        return (
            <PopoverElement onReset={() => this.props.onChange(null)}>
                {this.props.date || 'Date: Unspecified'}
                <Calendar
                    date={DateUtils.getDate(this.props.date || lastDate)}
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

DatePicker.contextType = DateContext;

export default DatePicker;
