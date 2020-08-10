import assert from 'assert';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { eachDayOfInterval, getDay } from 'date-fns';
import PropTypes from '../prop-types';
import DateUtils from '../../common/DateUtils';
import {
    Coordinator, DateRangePicker, ScrollableSection, TypeaheadOptions, TypeaheadSelector,
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
    static getDerivedStateFromProps(props, state) {
        const signature = JSON.stringify([props.search, state.dateRange]);
        if (state.signature === signature) {
            return state;
        }
        state.signature = signature;


        const where = {
            is_complete: true,
            is_major: true,
        };
        let dateSearch = false;
        props.search.forEach((item) => {
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
        state.where = where;
        state.dateSearch = dateSearch;

        state.dates = undefined;
        if (state.dateRange) {
            state.dates = eachDayOfInterval({
                start: DateUtils.getDate(state.dateRange.startDate),
                end: DateUtils.getDate(state.dateRange.endDate),
            }).map((date) => DateUtils.getLabel(date));
        }
        if (!state.dateSearch && !state.dates) {
            state.dates = [DateUtils.getTodayLabel()];
        }

        return state;
    }

    constructor(props) {
        super(props);
        this.state = { dateRange: null };
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.subscribe('log-event-created', (logEvent) => {
                if (!logEvent.isMajor && !this.props.search.length) {
                    this.props.onChange(ALL_EVENTS_ITEM);
                }
            }),
        ];
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        if (this.state.dateSearch) {
            const where = { ...this.state.where, date: this.state.dates };
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ dateSearch: false, dates: null });
            window.api.send('log-event-dates', { where })
                // eslint-disable-next-line react/no-did-update-set-state
                .then((result) => this.setState({ dates: result }));
        }
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    renderFilters() {
        return (
            <InputGroup>
                <DateRangePicker
                    dateRange={this.state.dateRange}
                    onChange={(dateRange) => this.setState({ dateRange })}
                />
                <TypeaheadSelector
                    id="log-event-search-topic-or-structure"
                    options={new TypeaheadOptions({
                        serverSideOptions: [{ name: 'log-topic' }, { name: 'log-structure' }],
                        suffixOptions: [INCOMPLETE_ITEM, ALL_EVENTS_ITEM],
                    })}
                    value={this.props.search}
                    disabled={this.props.disabled}
                    onChange={(items) => this.props.onChange(items)}
                    placeholder="Search ..."
                    multiple
                />
            </InputGroup>
        );
    }

    renderLogEvents() {
        if (this.state.dateSearch || !this.state.dates) {
            return null;
        }
        const today = DateUtils.getTodayLabel();
        const { where } = this.state;
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
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogEventSearch;
