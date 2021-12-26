import assert from 'assert';
import React from 'react';
import { eachDayOfInterval, getDay } from 'date-fns';
import PropTypes from '../prop-types';
import DateUtils from '../../common/DateUtils';
import { Coordinator } from '../Common';
import LogEventEditor from './LogEventEditor';
import LogEventList from './LogEventList';
import { getVirtualID, LogEvent } from '../../data';
import LogEventOptions from './LogEventOptions';

// Extra Filters for Events

const INCOMPLETE_ITEM = {
    __type__: 'incomplete',
    __id__: getVirtualID(),
    name: 'Incomplete Events',
    apply: (_item, where, extra) => {
        where.isComplete = false;
        extra.logEventsIncompleteView = true;
    },
};
const ALL_EVENTS_ITEM = {
    __type__: 'all-events',
    __id__: getVirtualID(),
    name: 'All Events',
    apply: (_item, where, _extra) => {
        delete where.logLevel;
    },
};

// Extra Actions for Events

const COMPLETE_ACTION = {
    __id__: 'complete',
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
    __id__: 'duplicate',
    name: 'Duplicate',
    perform: (logEvent) => {
        Coordinator.invoke('modal-editor', {
            dataType: 'log-event',
            EditorComponent: LogEventEditor,
            valueKey: 'logEvent',
            value: LogEvent.createVirtual({
                ...logEvent,
                date: logEvent.date ? DateUtils.getTodayLabel() : null,
            }),
        });
    },
};

function getDayOfTheWeek(label) {
    return DateUtils.DaysOfTheWeek[getDay(DateUtils.getDate(label))];
}

class LogEventSearch extends React.Component {
    static getTypeaheadOptions() {
        return LogEventOptions.get([
            INCOMPLETE_ITEM,
            ALL_EVENTS_ITEM,
        ]);
    }

    static getDerivedStateFromProps(props, _state) {
        return LogEventOptions.extractData(
            props.search,
            LogEventOptions.getTypeToActionMap([INCOMPLETE_ITEM, ALL_EVENTS_ITEM]),
        );
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
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    // eslint-disable-next-line class-methods-use-this
    renderDefaultView(where, moreProps) {
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

    renderMultipleDaysView(where, moreProps) {
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
                    showAdder
                    {...moreProps}
                />
            );
        });
    }

    renderSearchView(where, moreProps) {
        assert(where.isComplete);
        const displayDateMoreProps = {
            ...moreProps,
            viewerComponentProps: {
                ...moreProps.viewerComponentProps,
                displayDate: true,
            },
        };
        if (this.props.dateRange) {
            where = { ...where, date: this.props.dateRange };
        }
        return (
            <>
                <LogEventList
                    name="Complete"
                    where={{ ...where, isComplete: true }}
                    {...displayDateMoreProps}
                />
                <LogEventList
                    name="Incomplete (with deadlines)"
                    where={{ ...where, isComplete: false, date: 'ne(null)' }}
                    {...displayDateMoreProps}
                />
                <LogEventList
                    name="Incomplete (without deadlines)"
                    where={{ ...where, isComplete: false, date: null }}
                    {...moreProps}
                />
            </>
        );
    }

    // eslint-disable-next-line class-methods-use-this
    renderIncompleteView(where, moreProps) {
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
                    name="With Deadlines"
                    where={{ ...where, date: 'ne(null)' }}
                    {...displayDateMoreProps}
                />
                <LogEventList
                    name="Without Deadlines"
                    where={{ ...where, date: null }}
                    {...moreProps}
                />
            </>
        );
    }

    render() {
        const { where, extra } = this.state;

        const moreProps = { viewerComponentProps: {} };
        moreProps.prefixActions = [];
        moreProps.prefixActions.push(DUPLICATE_ACTION);
        if (!where.logLevel) {
            moreProps.allowReordering = true;
            moreProps.viewerComponentProps.displayLogLevel = true;
        }

        if (where.isComplete === false) {
            return this.renderIncompleteView(where, moreProps);
        } if (extra.searchView) {
            return this.renderSearchView(where, moreProps);
        } if (this.props.dateRange) {
            return this.renderMultipleDaysView(where, moreProps);
        }
        return this.renderDefaultView(where, moreProps);
    }
}

LogEventSearch.propTypes = {
    dateRange: PropTypes.Custom.DateRange,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default LogEventSearch;
