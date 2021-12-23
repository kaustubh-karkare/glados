import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import deepEqual from 'deep-equal';

import { DataLoader } from '../Common';
import PropTypes from '../prop-types';
import Enum from '../../common/Enum';
import { getGraphData } from './GraphSectionData';
import GraphSectionOptions, { Granularity } from './GraphSectionOptions';

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
        return GraphSectionOptions.get();
    }

    static getDerivedStateFromProps(props, state) {
        const result = GraphSectionOptions.getEventsQuery(props.search);
        result.granularity = result.granularity || Granularity.MONTH;
        if (!deepEqual(state.where, result.where)) {
            state.reload = true;
        }
        state.where = result.where;
        if (state.granularity !== result.granularity && state.logEvents) {
            state.graphData = getGraphData(
                state.logEvents,
                props.dateRange,
                result.granularity,
            );
        }
        state.granularity = result.granularity;
        return state;
    }

    constructor(props) {
        super(props);
        this.state = { graphData: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => {
                const { where } = this.state;
                if (!where.logStructure) {
                    return null;
                }
                return {
                    name: 'log-event-list',
                    args: {
                        where: {
                            ...where,
                            date: this.props.dateRange || undefined,
                        },
                    },
                };
            },
            onData: (logEvents) => {
                const { dateRange } = this.props;
                const { granularity } = this.state;
                this.setState({
                    logEvents,
                    graphData: getGraphData(logEvents, dateRange, granularity),
                });
            },
        });
    }

    componentDidUpdate(prevProps) {
        if (this.state.reload) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ reload: false });
            this.dataLoader.reload();
        }
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        const { where, graphData } = this.state;
        if (!where.logStructure) {
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
