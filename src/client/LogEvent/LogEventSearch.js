import assert from 'assert';
import React from 'react';
import { eachDayOfInterval, getDay } from 'date-fns';
import PropTypes from '../prop-types';
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

class LogEventSearch extends React.Component {
    static getTypeaheadOptions() {
        return new TypeaheadOptions({
            serverSideOptions: [{ name: 'log-topic' }, { name: 'log-structure' }],
            prefixOptions: [DATE_RANGE_ITEM, INCOMPLETE_ITEM, ALL_EVENTS_ITEM],
            onSelect: (option) => {
                if (option.__type__ === DATE_RANGE_ITEM.__type__) {
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
            is_complete: true,
            is_major: true,
        };
        let dates;
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
            } else if (item.__type__ === DATE_RANGE_ITEM.__type__) {
                const [startDate, endDate] = item.name.split(' to ');
                dates = eachDayOfInterval({
                    start: DateUtils.getDate(startDate),
                    end: DateUtils.getDate(endDate),
                }).map((date) => DateUtils.getLabel(date));
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
        if (dates || dateSearch) {
            state.dates = dates;
            state.dateSearch = !dates;
        } else {
            state.dates = [DateUtils.getTodayLabel()];
            state.dateSearch = false;
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
                if (!logEvent.isMajor && !this.props.search.length) {
                    Coordinator.invoke({ search: [ALL_EVENTS_ITEM] });
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
}

LogEventSearch.propTypes = {
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogEventSearch;
