import assert from 'assert';
import { addDays, eachDayOfInterval, getDay } from 'date-fns';
import React from 'react';

import { getVirtualID, LogEvent } from '../../common/data_types';
import DateUtils from '../../common/DateUtils';
import { Coordinator, DateContext, SettingsContext } from '../Common';
import PropTypes from '../prop-types';
import LogEventEditor from './LogEventEditor';
import LogEventList from './LogEventList';
import LogEventOptions from './LogEventOptions';

// Extra Filters for Events

const INCOMPLETE_ITEM = {
    __type__: 'incomplete',
    __id__: getVirtualID(),
    name: 'Incomplete Events',
    apply: (_item, where, _extra) => {
        where.isComplete = false;
    },
};

const LOG_LEVEL_MINOR_ITEM = {
    __type__: 'log-event-level',
    __id__: getVirtualID(),
    name: 'Log Level: Minor+',
};
const LOG_LEVEL_MAJOR_ITEM = {
    __type__: 'log-event-level',
    __id__: getVirtualID(),
    name: 'Log Level: Major+',
};
const LOG_LEVEL_MOCK_ITEM = {
    __type__: 'log-event-level',
    apply: (item, where, extra) => {
        if (item.__id__ === LOG_LEVEL_MINOR_ITEM.__id__) {
            delete where.logLevel; // [1, 2, 3]
            extra.allowReordering = true;
        } else if (item.__id__ === LOG_LEVEL_MAJOR_ITEM.__id__) {
            where.logLevel = [3];
            extra.searchView = true;
        }
    },
};

const DEFAULT_WHERE = {
    isComplete: true,
    logLevel: [2, 3],
};

function getDayOfTheWeek(label) {
    return DateUtils.DaysOfTheWeek[getDay(DateUtils.getDate(label))];
}

class LogEventSearch extends React.Component {
    static getTypeaheadOptions() {
        return LogEventOptions.get([
            INCOMPLETE_ITEM,
            LOG_LEVEL_MINOR_ITEM,
            LOG_LEVEL_MAJOR_ITEM,
        ]);
    }

    static getDerivedStateFromProps(props, _state) {
        return LogEventOptions.extractData(
            props.search,
            LogEventOptions.getTypeToActionMap([
                INCOMPLETE_ITEM,
                LOG_LEVEL_MOCK_ITEM,
            ]),
            DEFAULT_WHERE,
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
                    Coordinator.invoke('url-update', { search: [LOG_LEVEL_MINOR_ITEM] });
                }
            }),
        ];
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    // Extra Actions for Events

    getPlanForTodayAction() {
        const { todayLabel } = this.context;
        return {
            __id__: 'plan_for_today',
            name: 'Plan for Today',
            perform: (logEvent) => {
                window.api.send('log-event-upsert', {
                    ...logEvent,
                    date: todayLabel,
                    isComplete: false,
                });
            },
        };
    }

    getCompleteAction() {
        const { todayLabel } = this.context;
        return {
            __id__: 'complete',
            name: 'Complete',
            perform: (logEvent) => {
                window.api.send('log-event-upsert', {
                    ...logEvent,
                    date: todayLabel,
                    isComplete: true,
                });
            },
        };
    }

    getDuplicateAction() {
        const { todayLabel } = this.context;
        return {
            __id__: 'duplicate_for_today',
            name: 'Duplicate for Today',
            perform: (logEvent) => {
                Coordinator.invoke('modal-editor', {
                    dataType: 'log-event',
                    EditorComponent: LogEventEditor,
                    valueKey: 'logEvent',
                    value: LogEvent.createVirtual({
                        ...logEvent,
                        date: logEvent.date ? todayLabel : null,
                    }),
                });
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    renderDefaultView(where, moreProps, settings) {
        const { todayDate, todayLabel } = this.context;
        const todoMoreProps = {
            ...moreProps,
            prefixActions: [this.getCompleteAction(), ...moreProps.prefixActions],
        };
        const overdueAndUpcomingMoreProps = {
            ...todoMoreProps,
            viewerComponentProps: {
                ...todoMoreProps.viewerComponentProps,
                displayDate: true,
            },
            prefixActions: [this.getPlanForTodayAction(), ...todoMoreProps.prefixActions],
        };
        const results = [
            <LogEventList
                key="done"
                name="Done: Today"
                where={{ date: todayLabel, ...where, isComplete: true }}
                showAdder
                {...moreProps}
            />,
            <LogEventList
                key="todo"
                className="mt-4"
                name="Todo: Today"
                where={{
                    date: todayLabel, ...where, isComplete: false,
                }}
                showAdder
                {...todoMoreProps}
            />,
        ];
        if (settings.display_overdue_and_upcoming_events) {
            results.push(
                <LogEventList
                    key="tomorrow"
                    className="mt-4"
                    name="Todo: Tomorrow"
                    where={{
                        date: DateUtils.getLabel(addDays(todayDate, 1)),
                        ...where,
                        isComplete: false,
                    }}
                    showAdder
                    {...overdueAndUpcomingMoreProps}
                />,
                <LogEventList
                    key="upcoming"
                    className="mt-4"
                    name="Todo: Next 7 days"
                    where={{
                        date: {
                            startDate: DateUtils.getLabel(addDays(todayDate, 2)),
                            endDate: DateUtils.getLabel(addDays(todayDate, 7)),
                        },
                        ...where,
                        isComplete: false,
                    }}
                    {...overdueAndUpcomingMoreProps}
                />,
                <LogEventList
                    key="overdue"
                    className="mt-4"
                    name="Todo: Overdue"
                    where={{
                        date: `lt(${todayLabel})`, ...where, isComplete: false,
                    }}
                    {...overdueAndUpcomingMoreProps}
                />,
            );
        }
        return results;
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
        moreProps.prefixActions.push(this.getDuplicateAction());
        if (extra.allowReordering) {
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
        return (
            <SettingsContext.Consumer>
                {(settings) => this.renderDefaultView(where, moreProps, settings)}
            </SettingsContext.Consumer>
        );
    }
}

LogEventSearch.propTypes = {
    dateRange: PropTypes.Custom.DateRange,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

LogEventSearch.contextType = DateContext;

export default LogEventSearch;
