import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import {
    getTodayLabel, getTodayValue, getDateLabel, getDayOfTheWeek, getDurationValue, getDateRange,
} from '../../common/DateUtils';
import { Coordinator, Selector, TypeaheadSelector } from '../Common';
import Enum from '../../common/Enum';
import LogEventList from './LogEventList';

const [DateRangeOptions, DateRangeOptionType, DateRangeOptionsMap] = Enum([
    {
        label: 'Today',
        value: 'today',
        getDates: () => {
            const today = getTodayLabel();
            return [today];
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
    {
        label: 'Unspecified',
        value: 'unspecified',
        getDates: () => null,
    },
]);

class LogEventSelectorList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMajor: true,
            logTopic: null,
        };
        this.afterUpdate = this.afterUpdate.bind(this);
        Coordinator.register(
            'topic-select',
            (logTopic) => this.setState({ logTopic }, this.afterUpdate),
        );
    }

    componentDidMount() {
        this.setState({ dateRange: DateRangeOptionType.UNSPECIFIED }, this.afterUpdate);
    }

    getSelector() {
        const selector = { ...this.props.selector };
        if (this.state.isMajor) {
            selector.is_major = true;
        }
        if (this.state.logTopic) {
            selector.topic_id = this.state.logTopic.id;
        }
        selector.is_complete = true;
        return selector;
    }

    afterUpdate() {
        const option = DateRangeOptionsMap[this.state.dateRange];
        if (option.value === DateRangeOptionType.UNSPECIFIED) {
            const selector = this.getSelector();
            if (selector.topic_id) {
                window.api.send('log-event-dates', { selector })
                    .then((dates) => this.setState({ dates }));
            } else {
                this.setState({ dates: [getTodayLabel()] });
            }
        } else {
            this.setState({ dates: option.getDates() });
        }
    }

    renderFilters() {
        return (
            <InputGroup className="mb-2">
                <Selector
                    options={DateRangeOptions}
                    value={this.state.dateRange}
                    disabled={this.props.disabled}
                    onChange={(dateRange) => this.setState({ dateRange }, this.afterUpdate)}
                />
                <Selector.Binary
                    noLabel="All Events"
                    yesLabel="Major Events"
                    value={this.state.isMajor}
                    disabled={this.props.disabled}
                    onChange={(isMajor) => this.setState({ isMajor }, this.afterUpdate)}
                />
                <TypeaheadSelector
                    dataType="log-topic"
                    value={this.state.logTopic}
                    disabled={this.props.disabled}
                    onChange={(logTopic) => this.setState({ logTopic }, this.afterUpdate)}
                />
            </InputGroup>
        );
    }

    renderLogEvents() {
        const today = getTodayLabel();
        const { selector: _selector, ...moreProps } = this.props;
        const selector = this.getSelector();
        if (!this.state.isMajor) {
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
        if (!this.state.dates) {
            return 'Loading ...';
        }
        return (
            <div className="index-section">
                {this.renderFilters()}
                {this.renderLogEvents()}
            </div>
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
