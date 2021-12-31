// https://adphorus.github.io/react-date-range/
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

import React from 'react';
import { DateRangePicker as DateRangePickerOriginal } from 'react-date-range';

import DateUtils from '../../common/DateUtils';
import PropTypes from '../prop-types';
import PopoverElement from './PopoverElement';

const KEY = 'selection';

function DateRangeSelector(props) {
    const { dateRange } = props;
    return (
        <DateRangePickerOriginal
            direction="horizontal"
            months={1}
            moveRangeOnFirstSelection={false}
            showSelectionPreview
            ranges={[
                {
                    key: KEY,
                    startDate: DateUtils.getDate(dateRange.startDate),
                    endDate: DateUtils.getDate(dateRange.endDate),
                },
            ]}
            onChange={(ranges) => props.onChange({
                startDate: DateUtils.getLabel(ranges[KEY].startDate),
                endDate: DateUtils.getLabel(ranges[KEY].endDate),
            })}
        />
    );
}

DateRangeSelector.propTypes = {
    dateRange: PropTypes.Custom.DateRange.isRequired,
    onChange: PropTypes.func.isRequired,
};

class DateRangePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastDateRange: this.props.dateRange || {
                startDate: DateUtils.getTodayLabel(),
                endDate: DateUtils.getTodayLabel(),
            },
        };
    }

    renderSummary() {
        const { dateRange } = this.props;
        if (!dateRange) {
            return 'Date Range: Unspecified';
        }
        if (dateRange.startDate === dateRange.endDate) {
            return dateRange.startDate;
        }
        return `${dateRange.startDate} to ${dateRange.endDate}`;
    }

    render() {
        return (
            <PopoverElement onReset={() => this.props.onChange(null)}>
                {this.renderSummary()}
                <DateRangeSelector
                    dateRange={this.props.dateRange || this.state.lastDateRange}
                    onChange={(newDateRange) => {
                        this.setState({ lastDateRange: newDateRange });
                        this.props.onChange(newDateRange);
                    }}
                />
            </PopoverElement>
        );
    }
}

DateRangePicker.propTypes = {
    dateRange: PropTypes.Custom.DateRange,
    onChange: PropTypes.func.isRequired,
};

DateRangePicker.Selector = DateRangeSelector;

const DATE_RANGE_SEPARATOR = ' to ';

DateRangePicker.serialize = (dateRange) => {
    if (!dateRange) return null;
    return dateRange.startDate + DATE_RANGE_SEPARATOR + dateRange.endDate;
};

DateRangePicker.deserialize = (value) => {
    if (!value) return null;
    const [startDate, endDate] = value.split(DATE_RANGE_SEPARATOR);
    return { startDate, endDate };
};

export default DateRangePicker;
