import { DateRangePicker as DateRangePickerOriginal } from 'react-date-range';
import { MdClose } from 'react-icons/md';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import PropTypes from 'prop-types';
import React from 'react';
import InputLine from './InputLine';
import DateUtils from '../../common/DateUtils';

// https://adphorus.github.io/react-date-range/

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

const KEY = 'selection';

class DateRangePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastDateRange: { // useful after unspecified
                startDate: DateUtils.getTodayLabel(),
                endDate: DateUtils.getTodayLabel(),
            },
        };
    }

    onChange(ranges) {
        if (ranges[KEY]) {
            const dateRange = {
                startDate: DateUtils.getLabel(ranges[KEY].startDate),
                endDate: DateUtils.getLabel(ranges[KEY].endDate),
            };
            this.setState({ lastDateRange: dateRange });
            this.props.onChange(dateRange);
        } else {
            this.props.onChange(null);
        }
    }

    getRanges() {
        const ranges = [];
        const dateRange = this.props.dateRange || this.state.lastDateRange;
        ranges.push({
            key: KEY,
            startDate: DateUtils.getDate(dateRange.startDate),
            endDate: DateUtils.getDate(dateRange.endDate),
        });
        return ranges;
    }

    renderPopoverContent() {
        return (
            <DateRangePickerOriginal
                direction="horizontal"
                months={1}
                moveRangeOnFirstSelection={false}
                showSelectionPreview
                ranges={this.getRanges()}
                onChange={(ranges) => this.onChange(ranges)}
            />
        );
    }

    renderSummary() {
        const { dateRange } = this.props;
        if (dateRange) {
            return `${dateRange.startDate} to ${dateRange.endDate}`;
        }
        return 'Date Range: Unspecified';
    }

    renderOverlayTrigger() {
        const overlay = (
            <Popover id="date-range-selector">
                <Popover.Title as="h3">Date Range Selector</Popover.Title>
                <Popover.Content>
                    {this.renderPopoverContent()}
                </Popover.Content>
            </Popover>
        );
        return (
            <OverlayTrigger
                trigger="click"
                rootClose
                placement="bottom"
                overlay={overlay}
            >
                <InputLine styled className="px-1">
                    {this.renderSummary()}
                </InputLine>
            </OverlayTrigger>
        );
    }

    renderButton() {
        if (!this.props.dateRange) {
            return null;
        }
        return <Button onClick={() => this.props.onChange(null)}><MdClose /></Button>;
    }

    render() {
        return (
            <>
                {this.renderOverlayTrigger()}
                {this.renderButton()}
            </>
        );
    }
}

const DateRange = PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
});

DateRangePicker.propTypes = {
    dateRange: DateRange,
    onChange: PropTypes.func.isRequired,
};

export default DateRangePicker;
