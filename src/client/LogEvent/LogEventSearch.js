import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import {
    getTodayLabel, getTodayValue, getDateLabel, getDayOfTheWeek, getDurationValue, getDateRange,
} from '../../common/DateUtils';
import {
    Coordinator, ScrollableSection, Selector, TypeaheadSelector,
} from '../Common';
import Enum from '../../common/Enum';
import LogEventList from './LogEventList';

const DateRange = Enum([
    {
        label: 'Incomplete',
        value: 'incomplete',
        getDates: () => null,
    },
    {
        label: 'Unspecified',
        value: 'unspecified',
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

class LogEventSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMajor: true,
            logTopic: null,
        };
        this.afterUpdate = this.afterUpdate.bind(this);
        this.deregisterCallbacks = [
            Coordinator.register(
                'event-created',
                (logEvent) => this.setState((state) => {
                    if (!logEvent.isMajor && state.isMajor) state.isMajor = false;
                    // TODO: Reset topic filter if event does not contain it.
                    return state;
                }, this.afterUpdate),
            ),
            Coordinator.register(
                'topic-select',
                (logTopic) => this.setState({ logTopic }, this.afterUpdate),
            ),
        ];
    }

    componentDidMount() {
        this.setState({ dateRange: DateRange.UNSPECIFIED }, this.afterUpdate);
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    getSelector() {
        const selector = {};
        if (this.state.isMajor) {
            selector.is_major = true;
        }
        if (this.state.logTopic) {
            selector.topic_id = this.state.logTopic.id;
        }
        if (this.state.dateRange === DateRange.INCOMPLETE) {
            selector.is_complete = false;
        } else {
            selector.is_complete = true;
        }
        return selector;
    }

    afterUpdate() {
        const option = DateRange[this.state.dateRange];
        const dates = option.getDates();
        if (dates === null) {
            const selector = this.getSelector();
            if (selector.topic_id || !selector.is_complete) {
                window.api.send('log-event-dates', { selector })
                    .then((result) => this.setState({ dates: result }));
            } else {
                this.setState({ dates: [getTodayLabel()] });
            }
        } else {
            this.setState({ dates });
        }
    }

    renderFilters() {
        return (
            <InputGroup>
                <Selector
                    options={DateRange.Options}
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
                    placeholder="Topic Search ..."
                />
            </InputGroup>
        );
    }

    renderLogEvents() {
        const today = getTodayLabel();
        const selector = this.getSelector();
        const moreProps = {};
        if (!this.state.isMajor) {
            moreProps.allowReordering = true;
            moreProps.viewerComponentProps = { displayIsMajor: true };
        }
        return this.state.dates.map((date) => (
            <LogEventList
                key={date || 'null'}
                name={date ? `${date} : ${getDayOfTheWeek(date)}` : 'Unspecified'}
                selector={{ date, ...selector }}
                showAdder={date === today}
                {...moreProps}
            />
        ));
    }

    render() {
        if (!this.state.dates) {
            return null;
        }
        return (
            <>
                <div className="mb-1">
                    {this.renderFilters()}
                </div>
                <ScrollableSection padding={20 + 4}>
                    {this.renderLogEvents()}
                </ScrollableSection>
            </>
        );
    }
}

LogEventSearch.propTypes = {
    disabled: PropTypes.bool.isRequired,
};

export default LogEventSearch;
