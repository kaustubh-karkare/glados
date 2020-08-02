import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { eachDayOfInterval, getDay, subDays } from 'date-fns';
import DateUtils from '../../common/DateUtils';
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
        getDates: () => [DateUtils.getTodayDate()],
    },
    {
        label: 'Last 2 days',
        value: 'last_2_days',
        getDates: () => {
            const today = DateUtils.getTodayDate();
            const yesterday = subDays(today, 1);
            return [yesterday, today];
        },
    },
    {
        label: 'Last 7 days',
        value: 'last_7_days',
        getDates: () => {
            const today = DateUtils.getTodayDate();
            const before = subDays(today, 6);
            return eachDayOfInterval({ start: before, end: today });
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
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.subscribe(
                'log-event-created',
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
        this.setState({ dateRange: DateRange.UNSPECIFIED }, this.afterUpdate);
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    getWhere() {
        const where = {};
        if (this.state.isMajor) {
            where.is_major = true;
        }
        if (this.state.logTopic) {
            where.topic_id = this.state.logTopic.id;
        }
        if (this.state.dateRange === DateRange.INCOMPLETE) {
            where.is_complete = false;
        } else {
            where.is_complete = true;
        }
        return where;
    }

    afterUpdate() {
        const option = DateRange[this.state.dateRange];
        let dates = option.getDates();
        if (dates === null) {
            const where = this.getWhere();
            if (where.topic_id || !where.is_complete) {
                window.api.send('log-event-dates', { where })
                    .then((result) => this.setState({ dates: result }));
            } else {
                this.setState({ dates: [DateUtils.getTodayLabel()] });
            }
        } else {
            dates = dates.map((date) => DateUtils.getLabel(date));
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
        const today = DateUtils.getTodayLabel();
        const where = this.getWhere();
        const moreProps = {};
        if (!this.state.isMajor) {
            moreProps.allowReordering = true;
            moreProps.viewerComponentProps = { displayIsMajor: true };
        }
        return this.state.dates.map((date) => {
            let name = 'Unspecified';
            if (date) {
                name = `${date} ${DateUtils.DaysOfTheWeek[getDay(DateUtils.getDate(date))]}`;
            }
            return (
                <LogEventList
                    key={date || 'null'}
                    name={name}
                    where={{ date, ...where }}
                    showAdder={date === today}
                    {...moreProps}
                />
            );
        });
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
