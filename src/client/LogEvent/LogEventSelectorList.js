import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import {
    getTodayLabel, getTodayValue, getDateLabel, getDayOfTheWeek, getDurationValue, getDateRange,
} from '../../common/DateUtils';
import { Selector, TypeaheadSelector } from '../Common';
import Enum from '../../common/Enum';
import LogEventList from './LogEventList';

const [DateRangeOptions, DateRangeOptionType, DateRangeOptionsMap] = Enum([
    {
        label: 'All Time',
        value: 'all_time',
        getDates: () => null,
    },
    {
        label: 'Today',
        value: 'today',
        getDates: () => {
            const today = getTodayLabel();
            return [today];
        },
    },
    {
        label: 'Yesterday',
        value: 'yesterday',
        getDates: () => {
            const yesterday = getDateLabel(getTodayValue() - getDurationValue('1 day'));
            return [yesterday];
        },
    },
    {
        label: 'Last 2 days',
        value: 'last_2_days',
        getDates: () => {
            const todayValue = getTodayValue();
            const todayLabel = getDateLabel(todayValue);
            const yesterdayLabel = getDateLabel(todayValue - getDurationValue('1 day'));
            return [yesterdayLabel, todayLabel];
        },
    },
    {
        label: 'Last 7 days',
        value: 'last_7_days',
        getDates: () => {
            const today = getTodayLabel();
            const before = getDateLabel(getTodayValue() - getDurationValue('6 days'));
            return getDateRange(before, today);
        },
    },
]);

class LogEventSelectorList extends React.Component {
    constructor(props) {
        super(props);
        const selected = DateRangeOptionType.LAST_2_DAYS;
        this.state = {
            dateRangeSelectorValue: selected,
            dates: DateRangeOptionsMap[selected].getDates(),
            selectedLogTopic: null,
            displayMajorEventsOnly: true,
        };
        window.logEvent_selectTopic = (selectedLogTopic) => this.setState({ selectedLogTopic });
    }

    onDateRangeSelectorUpdate(value) {
        this.setState({
            dateRangeSelectorValue: value,
            dates: DateRangeOptionsMap[value].getDates(),
        });
        if (value === DateRangeOptionType.ALL_TIME) {
            window.api.send('dates')
                .then((dates) => this.setState({ dates }));
        }
    }

    renderFilters() {
        return (
            <InputGroup className="mb-2">
                <Selector
                    options={DateRangeOptions}
                    value={this.state.dateRangeSelectorValue}
                    disabled={this.props.disabled}
                    onChange={(value) => this.onDateRangeSelectorUpdate(value)}
                />
                <Selector.Binary
                    noLabel="All Events"
                    yesLabel="Major Events"
                    value={this.state.displayMajorEventsOnly}
                    disabled={this.props.disabled}
                    onChange={(value) => this.setState({ displayMajorEventsOnly: value })}
                />
                <TypeaheadSelector
                    dataType="log-topic"
                    value={this.state.selectedLogTopic}
                    disabled={this.props.disabled}
                    onChange={(selectedLogTopic) => this.setState({ selectedLogTopic })}
                />
            </InputGroup>
        );
    }

    renderLogEvents() {
        if (this.state.dates === null) {
            return 'Loading ...';
        }
        const today = getTodayLabel();
        let { selector, ...moreProps } = this.props;
        selector = { ...selector };
        moreProps = { ...moreProps };
        if (this.state.selectedLogTopic) {
            selector.topic_id = this.state.selectedLogTopic.id;
        }
        if (this.state.displayMajorEventsOnly) {
            selector.is_major = true;
        } else {
            moreProps.allowReordering = true;
            moreProps.viewerComponentProps = { displayIsMajor: true };
        }
        return this.state.dates.map((date) => (
            <LogEventList
                key={date}
                name={`${date} : ${getDayOfTheWeek(date)}`}
                selector={{ date, ...selector }}
                showAdder={date === today}
                {...moreProps}
            />
        ));
    }

    render() {
        return (
            <>
                {this.renderFilters()}
                {this.renderLogEvents()}
            </>
        );
    }
}

LogEventSelectorList.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
    disabled: PropTypes.bool,
};

LogEventSelectorList.defaultProps = {
    disabled: false,
};

export default LogEventSelectorList;
