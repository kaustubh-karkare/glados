import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { eachDayOfInterval, getDay } from 'date-fns';
import DateUtils from '../../common/DateUtils';
import {
    Coordinator, DateRangePicker, ScrollableSection, Selector, TypeaheadSelector,
} from '../Common';
import LogEventList from './LogEventList';

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
        this.setState({ dateRange: null }, this.afterUpdate);
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
        return where;
    }

    afterUpdate() {
        const { dateRange } = this.state;
        let dates;
        if (dateRange) {
            dates = eachDayOfInterval({
                start: DateUtils.getDate(dateRange.startDate),
                end: DateUtils.getDate(dateRange.endDate),
            }).map((date) => DateUtils.getLabel(date));
        }
        const where = this.getWhere();
        if (where.topic_id) {
            where.dates = dates;
            window.api.send('log-event-dates', { where })
                .then((result) => this.setState({ dates: result }));
        } else {
            this.setState({ dates: dates || [DateUtils.getTodayLabel()] });
        }
    }

    renderFilters() {
        return (
            <InputGroup>
                <DateRangePicker
                    dateRange={this.state.dateRange}
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
