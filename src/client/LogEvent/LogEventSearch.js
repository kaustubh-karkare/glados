import assert from 'assert';
import React from 'react';
import { eachDayOfInterval, getDay, subDays } from 'date-fns';
import PropTypes from 'prop-types';
import DateUtils from '../../common/DateUtils';
import {
    Coordinator, TypeaheadOptions,
} from '../Common';
import LogEventList from './LogEventList';
import { getVirtualID } from '../../data';

const DATE_RANGE_ITEM = {
    __type__: 'date-range',
    id: getVirtualID(),
    name: 'Date Range',
    getItem(option) {
        return new Promise((resolve) => {
            Coordinator.invoke('modal-date-range', {
                dateRange: {
                    startDate: DateUtils.getTodayLabel(),
                    endDate: DateUtils.getTodayLabel(),
                },
                onClose: (dateRange) => {
                    if (dateRange) {
                        resolve({
                            __type__: option.__type__,
                            id: 0,
                            name: `${dateRange.startDate} to ${dateRange.endDate}`,
                        });
                    } else {
                        resolve(null);
                    }
                },
            });
        });
    },
};
const YESTERDAY_ITEM = {
    __type__: 'date-range',
    id: getVirtualID(),
    name: 'Yesterday',
    getItem(option) {
        const yesterday = DateUtils.getLabel(subDays(DateUtils.getTodayDate(), 1));
        return Promise.resolve({
            __type__: option.__type__,
            id: 0,
            name: `${yesterday} to ${yesterday}`,
        });
    },
};
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

const SPECIAL_ITEMS = [DATE_RANGE_ITEM, YESTERDAY_ITEM, INCOMPLETE_ITEM, ALL_EVENTS_ITEM];

function getDayOfTheWeek(label) {
    return DateUtils.DaysOfTheWeek[getDay(DateUtils.getDate(label))];
}

class LogEventSearch extends React.Component {
    static getTypeaheadOptions() {
        return new TypeaheadOptions({
            serverSideOptions: [{ name: 'log-topic' }, { name: 'log-structure' }],
            prefixOptions: SPECIAL_ITEMS,
            onSelect: (option) => {
                if (option && option.getItem) {
                    return option.getItem(option);
                }
                return undefined;
            },
        });
    }

    static getDerivedStateFromProps(props, state) {
        const signature = JSON.stringify([props.search, state.dateRange]);
        if (state.signature === signature) {
            return state;
        }
        state.signature = signature;

        const where = {
            isComplete: true,
            logLevel: [2, 3],
        };
        let dates;
        let dateSearch = false;
        props.search.forEach((item) => {
            if (item.__type__ === 'log-structure') {
                assert(!where.logStructure);
                where.logStructure = item;
                dateSearch = true;
            } else if (item.__type__ === 'log-topic') {
                if (!where.logTopics) {
                    where.logTopics = [];
                }
                where.logTopics.push(item);
                dateSearch = true;
            } else if (item.__type__ === DATE_RANGE_ITEM.__type__) {
                const [startDate, endDate] = item.name.split(' to ');
                dates = eachDayOfInterval({
                    start: DateUtils.getDate(startDate),
                    end: DateUtils.getDate(endDate),
                }).map((date) => DateUtils.getLabel(date));
            } else if (item.__type__ === INCOMPLETE_ITEM.__type__) {
                where.isComplete = false;
                dateSearch = true;
            } else if (item.__type__ === ALL_EVENTS_ITEM.__type__) {
                delete where.logLevel;
            } else {
                assert(false, item);
            }
        });
        state.where = where;
        if (dates || dateSearch) {
            state.dates = dates;
            state.dateSearch = !dates;
            state.defaultDisplay = false;
        } else {
            state.dates = null;
            state.dateSearch = false;
            state.defaultDisplay = true;
        }
        return state;
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.subscribe('log-event-created', (logEvent) => {
                if (logEvent.logLevel === 1 && !this.props.search.length) {
                    Coordinator.invoke('url-update', { search: [ALL_EVENTS_ITEM] });
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

    render() {
        if (this.state.defaultDisplay ? false : !this.state.dates) {
            return null; // Loading ...
        }
        const { where } = this.state;
        const moreProps = { viewerComponentProps: {} };
        if (!where.logLevel) {
            moreProps.allowReordering = true;
            moreProps.viewerComponentProps.displayLogLevel = true;
        }
        if (this.state.defaultDisplay) {
            const today = DateUtils.getTodayLabel();
            const upcomingMoreProps = {
                ...moreProps,
                viewerComponentProps: { ...moreProps.viewerComponentProps },
            };
            upcomingMoreProps.viewerComponentProps.displayDate = true;
            upcomingMoreProps.prefixActions = [
                {
                    id: 'complete',
                    name: 'Complete',
                    perform: (logEvent) => {
                        window.api.send('log-event-upsert', {
                            ...logEvent,
                            date: DateUtils.getTodayLabel(),
                            isComplete: true,
                        });
                    },
                },
            ];
            return (
                <>
                    <LogEventList
                        name="Done (Today)"
                        where={{ date: today, ...where, isComplete: true }}
                        showAdder
                        {...moreProps}
                    />
                    <div className="mt-4" />
                    <LogEventList
                        name="Todo (Today)"
                        where={{
                            date: today, ...where, isComplete: false,
                        }}
                        showAdder
                        {...moreProps}
                    />
                    <div className="mt-4" />
                    <LogEventList
                        name="Todo (Overdue)"
                        where={{
                            date: today, ...where, isComplete: false, dateOp: 'lt',
                        }}
                        {...upcomingMoreProps}
                    />
                    <div className="mt-4" />
                    <LogEventList
                        name="Todo (Upcoming)"
                        where={{
                            date: today, ...where, isComplete: false, dateOp: 'gt',
                        }}
                        {...upcomingMoreProps}
                    />
                </>
            );
        }
        return this.state.dates.map((date) => {
            let name = 'Unspecified';
            if (date) {
                name = `${date} ${getDayOfTheWeek(date)}`;
            }
            return (
                <LogEventList
                    key={date || 'null'}
                    name={name}
                    where={{ date, ...where }}
                    {...moreProps}
                />
            );
        });
    }
}

LogEventSearch.propTypes = {
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogEventSearch;
