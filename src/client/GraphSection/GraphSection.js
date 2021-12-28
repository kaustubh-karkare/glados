import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import deepEqual from 'deep-equal';

import { DataLoader } from '../Common';
import PropTypes from '../prop-types';
import { Enum } from '../../common/data_types';
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
        const result = GraphSectionOptions.extractData(props.search);
        const newGranularity = result.extra.granularity || Granularity.WEEK;
        if (!deepEqual(state.where, result.where)) {
            state.reload = true;
        }
        state.where = result.where;
        state.hasAnyFilters = Object.keys(state.where).length > 1; // exclude isComplete
        if (state.granularity !== newGranularity && state.logEvents) {
            state.graphData = getGraphData(
                state.where.logStructure,
                state.logEvents,
                props.dateRange,
                newGranularity,
            );
        }
        state.granularity = newGranularity;
        return state;
    }

    constructor(props) {
        super(props);
        this.state = { graphData: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => {
                const { hasAnyFilters, where } = this.state;
                if (!hasAnyFilters) {
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
                const { where, granularity } = this.state;
                const graphData = getGraphData(
                    where.logStructure,
                    logEvents,
                    dateRange,
                    granularity,
                );
                this.setState({ logEvents, graphData });
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
        const { hasAnyFilters, graphData } = this.state;
        if (!hasAnyFilters) {
            return 'Please add some filters!';
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
