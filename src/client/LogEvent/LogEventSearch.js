import assert from 'assert';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { eachDayOfInterval, getDay } from 'date-fns';
import DateUtils from '../../common/DateUtils';
import {
    Coordinator, DateRangePicker, ScrollableSection, TypeaheadSelector,
} from '../Common';
import LogEventList from './LogEventList';
import { getVirtualID } from '../../data';

const INCOMPLETE_ITEM = {
    __type__: 'incomplete',
    id: getVirtualID(),
    name: 'Incomplete Events',
};
const ALL_EVENTS_ITEM = {
    __type__: 'all-events',
    id: getVirtualID(),
    name: 'All Events',
};

class LogEventSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
        this.afterUpdate = this.afterUpdate.bind(this);
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.subscribe(
                'log-event-created',
                (logEvent) => this.setState((state) => {
                    if (!logEvent.isMajor && !state.items.length) {
                        state.items.push(ALL_EVENTS_ITEM);
                    }
                    return state;
                }, this.afterUpdate),
            ),
            Coordinator.register(
                'log-structure-select',
                (logStructure) => this.setState({ items: [logStructure] }, this.afterUpdate),
            ),
            Coordinator.register(
                'log-topic-select',
                (logTopic) => this.setState({ items: [logTopic] }, this.afterUpdate),
            ),
        ];
        this.setState({ dateRange: null }, this.afterUpdate);
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    getWhere() {
        const where = {
            is_complete: true,
            is_major: true,
        };
        let dateSearch = false;
        this.state.items.forEach((item) => {
            if (item.__type__ === 'log-structure') {
                if (!where.structure_id) {
                    where.structure_id = [];
                }
                where.structure_id.push(item.id);
                dateSearch = true;
            } else if (item.__type__ === 'log-topic') {
                if (!where.topic_id) {
                    where.topic_id = [];
                }
                where.topic_id.push(item.id);
                dateSearch = true;
            } else if (item.__type__ === INCOMPLETE_ITEM.__type__) {
                where.is_complete = false;
                dateSearch = true;
            } else if (item.__type__ === ALL_EVENTS_ITEM.__type__) {
                delete where.is_major;
            } else {
                assert(false, item);
            }
        });
        return { where, dateSearch };
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
        const { where, dateSearch } = this.getWhere();
        if (dateSearch) {
            if (dates) where.date = dates;
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
                <TypeaheadSelector
                    id="log-event-search-topic-or-structure"
                    serverSideTypes={['log-topic', 'log-structure']}
                    clientSideOptions={[INCOMPLETE_ITEM, ALL_EVENTS_ITEM]}
                    value={this.state.items}
                    disabled={this.props.disabled}
                    onChange={(items) => this.setState({ items }, this.afterUpdate)}
                    placeholder="Search ..."
                    multiple
                />
            </InputGroup>
        );
    }

    renderLogEvents() {
        const today = DateUtils.getTodayLabel();
        const { where } = this.getWhere();
        const moreProps = {};
        if (!where.is_major) {
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
