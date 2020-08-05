import { DateRangePicker as DateRangePickerOriginal } from 'react-date-range';
import PropTypes from 'prop-types';
import React from 'react';
import PopoverElement from './PopoverElement';
import DateUtils from '../../common/DateUtils';

// https://adphorus.github.io/react-date-range/

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

const KEY = 'selection';

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

    renderPopoverContent() {
        const dateRange = this.props.dateRange || this.state.lastDateRange;
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
                onChange={(ranges) => {
                    const newDateRange = {
                        startDate: DateUtils.getLabel(ranges[KEY].startDate),
                        endDate: DateUtils.getLabel(ranges[KEY].endDate),
                    };
                    this.setState({ lastDateRange: newDateRange });
                    this.props.onChange(newDateRange);
                }}
            />
        );
    }

    render() {
        return (
            <PopoverElement onReset={() => this.props.onChange(null)}>
                {this.renderSummary()}
                {this.renderPopoverContent()}
            </PopoverElement>
        );
    }
}

DateRangePicker.propTypes = {
    dateRange: PropTypes.shape({
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string.isRequired,
    }),
    onChange: PropTypes.func.isRequired,
};

export default DateRangePicker;
