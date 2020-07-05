import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import {
    getTodayLabel, getTodayValue, getDateLabel, getDayOfTheWeek, getDurationValue, getDateRange,
} from '../../common/DateUtils';
import { Selector, TypeaheadSelector } from '../Common';
import Enum from '../../common/Enum';
import LogEventList from './LogEventList';

const [Options, OptionType, OptionsMap] = Enum([
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
        label: 'Last 7 days',
        value: 'last_7_days',
        getDates: () => {
            const today = getTodayLabel();
            const before = getDateLabel(getTodayValue() - getDurationValue('7 days'));
            return getDateRange(before, today);
        },
    },
]);

class LogEventSelectorList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dateRangeSelectorValue: OptionType.TODAY,
            dates: OptionsMap[OptionType.TODAY].getDates(),
            selectedLogTopic: null,
        };
        window.logEvent_selectTopic = (selectedLogTopic) => this.setState({ selectedLogTopic });
    }

    onDateRangeSelectorUpdate(value) {
        this.setState({
            dateRangeSelectorValue: value,
            dates: OptionsMap[value].getDates(),
        });
        if (value === OptionType.ALL_TIME) {
            window.api.send('dates')
                .then((dates) => this.setState({ dates }));
        }
    }

    renderFilters() {
        return (
            <InputGroup className="mb-2">
                <Selector
                    options={Options}
                    value={this.state.dateRangeSelectorValue}
                    onChange={(value) => this.onDateRangeSelectorUpdate(value)}
                />
                <TypeaheadSelector
                    dataType="log-topic"
                    value={this.state.selectedLogTopic}
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
        const { selector, ...moreProps } = this.props;
        const augmentedSelector = { ...selector };
        if (this.state.selectedLogTopic) {
            augmentedSelector.topic_id = this.state.selectedLogTopic.id;
        }
        return this.state.dates.map((date) => (
            <LogEventList
                key={date}
                name={`${date} : ${getDayOfTheWeek(date)}`}
                selector={{ date, ...augmentedSelector }}
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
};

export default LogEventSelectorList;
