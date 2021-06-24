import assert from 'assert';
import React from 'react';
import { eachDayOfInterval, getDay } from 'date-fns';
import PropTypes from '../prop-types';
import DateUtils from '../../common/DateUtils';
import {
    Coordinator, TypeaheadOptions,
} from '../Common';
import LogEventEditor from './LogEventEditor';
import LogEventList from './LogEventList';
import { getVirtualID, LogEvent } from '../../data';

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
const NO_STRUCTURE_ITEM = {
    __type__: 'no-structure',
    id: getVirtualID(),
    name: 'No Structure',
};

const EVENT_TITLE_ITEM_TYPE = 'log-event-title';
const EVENT_TITLE_ITEM_PREFIX = 'Title: ';

const SPECIAL_ITEMS = [
    INCOMPLETE_ITEM,
    ALL_EVENTS_ITEM,
    NO_STRUCTURE_ITEM,
];

const COMPLETE_ACTION = {
    id: 'complete',
    name: 'Complete',
    perform: (logEvent) => {
        window.api.send('log-event-upsert', {
            ...logEvent,
            date: DateUtils.getTodayLabel(),
            isComplete: true,
        });
    },
};

const DUPLICATE_ACTION = {
    id: 'duplicate',
    name: 'Duplicate',
    perform: (logEvent) => {
        Coordinator.invoke('modal-editor', {
            dataType: 'log-event',
            EditorComponent: LogEventEditor,
            valueKey: 'logEvent',
            value: LogEvent.createVirtual({
                ...logEvent,
                date: DateUtils.getTodayLabel(),
            }),
        });
    },
};

function getDayOfTheWeek(label) {
    return DateUtils.DaysOfTheWeek[getDay(DateUtils.getDate(label))];
}

class LogEventSearch extends React.Component {
    static getTypeaheadOptions(logMode) {
        const where = { logMode: logMode || undefined };
        return new TypeaheadOptions({
            serverSideOptions: [
                { name: 'log-topic', args: { where } },
                { name: 'log-structure', args: { where } },
            ],
            prefixOptions: SPECIAL_ITEMS,
            computedOptionTypes: [EVENT_TITLE_ITEM_TYPE],
            getComputedOptions: async (query) => {
                const options = [];
                if (query) {
                    options.push({
                        __type__: EVENT_TITLE_ITEM_TYPE,
                        id: getVirtualID(),
                        name: EVENT_TITLE_ITEM_PREFIX + query,
                    });
                }
                return options;
            },
            onSelect: (option) => {
                if (option && option.getItem) {
                    return option.getItem(option);
                }
                return undefined;
            },
        });
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.subscribe('log-event-created', (logEvent) => {
                if (logEvent.logLevel === 1 && !this.props.search.length) {
                    Coordinator.invoke('url-update', { search: [ALL_EVENTS_ITEM] });
                }
            }),
        ];
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    // eslint-disable-next-line class-methods-use-this
    renderDefault(where, moreProps) {
        const today = DateUtils.getTodayLabel();
        const todoMoreProps = {
            ...moreProps,
            prefixActions: [...moreProps.prefixActions, COMPLETE_ACTION],
        };
        const overdueAndUpcomingMoreProps = {
            ...todoMoreProps,
            viewerComponentProps: {
                ...todoMoreProps.viewerComponentProps,
                displayDate: true,
            },
        };
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
                    {...todoMoreProps}
                />
                <div className="mt-4" />
                <LogEventList
                    name="Todo (Overdue)"
                    where={{
                        date: `lt(${today})`, ...where, isComplete: false,
                    }}
                    {...overdueAndUpcomingMoreProps}
                />
                <div className="mt-4" />
                <LogEventList
                    name="Todo (Upcoming)"
                    where={{
                        date: `gt(${today})`, ...where, isComplete: false,
                    }}
                    {...overdueAndUpcomingMoreProps}
                />
            </>
        );
    }

    renderMultipleDays(where, moreProps) {
        return eachDayOfInterval({
            start: DateUtils.getDate(this.props.dateRange.startDate),
            end: DateUtils.getDate(this.props.dateRange.endDate),
        }).map((date) => {
            const dateLabel = DateUtils.getLabel(date);
            return (
                <LogEventList
                    key={dateLabel}
                    name={`${dateLabel} (${getDayOfTheWeek(dateLabel)})`}
                    where={{ date: dateLabel, ...where }}
                    {...moreProps}
                />
            );
        });
    }

    renderSearchResults(where, moreProps) {
        moreProps.viewerComponentProps.displayDate = true;
        if (this.props.dateRange) {
            where = { ...where, date: this.props.dateRange };
        }
        return (
            <LogEventList
                name="Search Results"
                where={where}
                {...moreProps}
            />
        );
    }

    // eslint-disable-next-line class-methods-use-this
    renderIncomplete(where, moreProps) {
        const displayDateMoreProps = {
            ...moreProps,
            viewerComponentProps: {
                ...moreProps.viewerComponentProps,
                displayDate: true,
            },
        };
        return (
            <>
                <LogEventList
                    name="With Dates"
                    where={{ ...where, date: 'ne(null)' }}
                    {...displayDateMoreProps}
                />
                <LogEventList
                    name="Without Dates"
                    where={{ ...where, date: null }}
                    {...moreProps}
                />
            </>
        );
    }

    render() {
        // Filters for the default view.
        const where = {
            logMode: this.props.logMode || undefined,
            isComplete: true,
            logLevel: [2, 3],
        };
        let searchResultMode = false;
        let incompleteMode = false;
        this.props.search.forEach((item) => {
            if (item.__type__ === 'log-structure') {
                assert(!where.logStructure);
                where.logStructure = item;
                searchResultMode = true;
            } else if (item.__type__ === NO_STRUCTURE_ITEM.__type__) {
                assert(!where.logStructure);
                where.logStructure = null;
                searchResultMode = true;
            } else if (item.__type__ === 'log-topic') {
                if (!where.logTopics) {
                    where.logTopics = [];
                }
                where.logTopics.push(item);
                searchResultMode = true;
            } else if (item.__type__ === EVENT_TITLE_ITEM_TYPE) {
                where.title = item.name.substring(EVENT_TITLE_ITEM_PREFIX.length);
                searchResultMode = true;
            } else if (item.__type__ === INCOMPLETE_ITEM.__type__) {
                where.isComplete = false;
                incompleteMode = true;
            } else if (item.__type__ === ALL_EVENTS_ITEM.__type__) {
                delete where.logLevel;
            } else {
                assert(false, item);
            }
        });

        const moreProps = { viewerComponentProps: {} };
        moreProps.prefixActions = [];
        moreProps.prefixActions.push(DUPLICATE_ACTION);
        if (!where.logLevel && !where.logMode) {
            moreProps.allowReordering = true;
            moreProps.viewerComponentProps.displayLogLevel = true;
        }


        if (incompleteMode) {
            return this.renderIncomplete(where, moreProps);
        } if (searchResultMode) {
            return this.renderSearchResults(where, moreProps);
        } if (this.props.dateRange) {
            return this.renderMultipleDays(where, moreProps);
        }
        return this.renderDefault(where, moreProps);
    }
}

LogEventSearch.propTypes = {
    logMode: PropTypes.Custom.LogMode,
    dateRange: PropTypes.Custom.DateRange,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogEventSearch;
