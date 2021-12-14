import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
    addDays, compareAsc, getDay, getMonth, getYear, subDays,
} from 'date-fns';
import deepEqual from 'deep-equal';

import { TypeaheadOptions, DataLoader } from '../Common';
import DateUtils from '../../common/DateUtils';
import PropTypes from '../prop-types';
import { LogStructure } from '../../data';
import Enum from '../../common/Enum';
import TextEditorUtils from '../../common/TextEditorUtils';

import './GraphSection.css';

const _AggregationType = Enum([
    {
        label: 'Maximum',
        value: 'maximum',
    },
    {
        label: 'Minimum',
        value: 'minimum',
    },
    {
        label: 'Average',
        value: 'average',
    },
    {
        label: 'Sum',
        value: 'sum',
    },
]);

const Granularity = Enum([
    {
        label: 'Day',
        value: 'day',
        getLabel: (date) => DateUtils.getLabel(date),
    },
    {
        label: 'Week',
        value: 'week',
        getLabel: (date) => {
            const dayOfWeek = getDay(date);
            const startDateOfWeek = subDays(date, dayOfWeek);
            return DateUtils.getLabel(startDateOfWeek);
        },
    },
    {
        label: 'Month',
        value: 'month',
        getLabel: (date) => {
            let month = (getMonth(date) + 1).toString();
            month = (month.length === 1 ? '0' : '') + month;
            return `${getYear(date)}-${month}`;
        },
    },
]);

const GRANULARITY_TYPE = 'graph-granularity';
const GRANULARITY_PREFIX = 'Granularity: ';

const CustomTooltip = ({ active, label, payload }) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        const output = [];
        output.push(`Group: ${label}`);
        output.push(`${item.name}: ${item.payload[item.dataKey]}`);
        const { logEventTitles } = item.payload;
        if (logEventTitles.length) {
            output.push('', ...logEventTitles);
        }
        return (
            <div className="graph-tooltip">
                {output.map((line) => `${line}\n`).join('')}
            </div>
        );
    }
    return null;
};

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    label: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    payload: PropTypes.any,
};

class GraphSection extends React.Component {
    static getTypeaheadOptions() {
        const GranularityOptions = Granularity.Options.map((item, index) => ({
            __type__: GRANULARITY_TYPE,
            id: -index - 1,
            name: GRANULARITY_PREFIX + item.label,
        }));
        return new TypeaheadOptions({
            prefixOptions: GranularityOptions,
            serverSideOptions: [
                { name: 'log-structure' },
                { name: 'log-topic' },
            ],
        });
    }

    constructor(props) {
        super(props);
        this.state = { graphData: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => {
                const { logStructure, logTopics } = this.getInputFromProps();
                if (!logStructure) {
                    return null;
                }
                return {
                    name: 'log-event-list',
                    args: {
                        where: {
                            date: this.props.dateRange || undefined,
                            logStructure,
                            logTopics: logTopics.length ? logTopics : undefined,
                        },
                    },
                };
            },
            onData: (logEvents) => this.setState({
                logEvents,
                graphData: this.getGraphData(logEvents),
            }),
        });
    }

    componentDidUpdate(prevProps) {
        const { granularity: prevGranularity, ...prevInput } = this.getInputFromProps(prevProps);
        const { granularity: nextGranularity, ...nextInput } = this.getInputFromProps(this.props);
        if (!deepEqual(prevInput, nextInput)) {
            this.dataLoader.reload();
        } else if (prevGranularity !== nextGranularity) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState((state) => {
                if (!state.logEvents) {
                    return {};
                }
                return { graphData: this.getGraphData(state.logEvents) };
            });
        }
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    getInputFromProps(props) {
        let granularity = Granularity.WEEK;
        let logStructure = null;
        const logTopics = [];
        (props ? props.search : this.props.search).forEach((item) => {
            if (item.__type__ === GRANULARITY_TYPE) {
                // Assumption here name.toLowerCase() == value
                granularity = item.name.substr(GRANULARITY_PREFIX.length).toLowerCase();
            } if (item.__type__ === 'log-structure') {
                logStructure = item;
            } if (item.__type__ === 'log-topic') {
                logTopics.push(item);
            }
        });
        return { granularity, logStructure, logTopics };
    }

    // eslint-disable-next-line class-methods-use-this
    getLogKeySample(keyIndex, valueParser, logEvents) {
        if (logEvents.length === 0) {
            return null;
        }
        // TODO: Support _AggregationType to combine multiple events?
        const logEvent = logEvents[logEvents.length - 1];
        const logKey = logEvent.logStructure.logKeys[keyIndex];
        if (logKey.value === null) {
            return null;
        }
        return valueParser(logKey.value);
    }

    // eslint-disable-next-line class-methods-use-this
    getLines(logEvent) {
        const lines = [];
        lines.push({
            name: 'Count',
            getSample: (logEvents) => logEvents.length,
        });
        logEvent.logStructure.logKeys.forEach((logKey, index) => {
            let valueParser;
            if (logKey.type === LogStructure.Key.INTEGER) {
                valueParser = parseInt;
            } else if (logKey.type === LogStructure.Key.NUMBER) {
                valueParser = parseFloat;
            } else if (logKey.type === LogStructure.Key.TIME) {
                valueParser = (value) => parseInt(value.replace(':', ''), 10);
            } else {
                return;
            }
            lines.push({
                name: logKey.name,
                getSample: this.getLogKeySample.bind(this, index, valueParser),
            });
        });
        // TODO: Add support for custom graphs?
        return lines;
    }

    // eslint-disable-next-line class-methods-use-this
    getTimeSeries(logEvents, lines, granularity) {
        if (logEvents.length === 0) {
            return [];
        }
        const dateLabelToLogEvents = {};
        logEvents.forEach((item) => {
            if (!item.date) {
                return;
            }
            if (!(item.date in dateLabelToLogEvents)) {
                dateLabelToLogEvents[item.date] = [];
            }
            dateLabelToLogEvents[item.date].push(item);
        });
        let startDate;
        let endDate;
        if (this.props.dateRange) {
            startDate = DateUtils.getDate(this.props.dateRange.startDate);
            endDate = DateUtils.getDate(this.props.dateRange.endDate);
        } else {
            const dateLabels = Object.keys(dateLabelToLogEvents).sort();
            startDate = DateUtils.getDate(dateLabels[0]);
            endDate = DateUtils.getDate(dateLabels[dateLabels.length - 1]);
        }
        const samples = [];
        for (
            let currentDate = startDate;
            compareAsc(currentDate, endDate) <= 0;
        ) {
            const currentLogEvents = [];
            let label = null;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const nextLabel = Granularity[granularity].getLabel(currentDate);
                if (label === null) {
                    label = nextLabel;
                } else if (label === nextLabel) {
                    // nothing changes
                } else {
                    break; // move to next group
                }
                const dateLabel = DateUtils.getLabel(currentDate);
                const nextLogEvents = dateLabelToLogEvents[dateLabel] || [];
                currentLogEvents.push(...nextLogEvents);
                currentDate = addDays(currentDate, 1);
            }
            const sample = { label };
            lines.forEach((line, index) => {
                sample[index] = line.getSample(currentLogEvents);
            });
            sample.logEventTitles = currentLogEvents.map(
                (logEvent) => TextEditorUtils.extractPlainText(logEvent.title),
            );
            samples.push(sample);
        }
        return samples;
    }

    getGraphData(logEvents) {
        const { granularity } = this.getInputFromProps();
        if (!logEvents || !logEvents.length) return { isEmpty: true };
        try {
            const lines = this.getLines(logEvents[0]);
            const samples = this.getTimeSeries(logEvents, lines, granularity);
            const ticks = null;
            return { lines, samples, ticks };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            throw error;
        }
    }

    render() {
        const { logStructure } = this.getInputFromProps();
        const { graphData } = this.state;
        if (!logStructure) {
            return null;
        } if (!graphData) {
            return 'Loading ...';
        } if (graphData.isEmpty) {
            return 'No data!';
        }
        return graphData.lines.map((line, index) => (
            <ResponsiveContainer key={line.name} width="100%" height={400}>
                <LineChart
                    data={graphData.samples}
                    margin={{
                        top: 20, right: 40, bottom: 50, left: 10,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" angle={-90} dx={-6} dy={40} ticks={graphData.ticks} />
                    <YAxis domain={['dataMin', 'dataMax']} scale="linear" />
                    <Legend />
                    <Tooltip content={CustomTooltip} />
                    <Line
                        name={line.name}
                        dataKey={index}
                        type="monotone"
                        stroke="#00bc8c"
                        connectNulls
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        ));
    }
}

GraphSection.propTypes = {
    dateRange: PropTypes.Custom.DateRange,
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default GraphSection;
