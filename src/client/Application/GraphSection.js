import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { addDays, compareAsc } from 'date-fns';
import { TypeaheadOptions, DataLoader } from '../Common';

import DateUtils from '../../common/DateUtils';
import PropTypes from '../prop-types';
import { LogStructure } from '../../data';

import './GraphSection.css';

const CustomTooltip = ({ active, label, payload }) => {
    if (active && payload && payload.length) {
        const line = payload[0];
        // TODO: Add background style.
        return (
            <div className="graph-tooltip">
                {'Date: '}
                {label}
                <br />
                {line.name}
                {': '}
                {line.payload[line.dataKey]}
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
        return TypeaheadOptions.get(['log-structure']);
    }

    constructor(props) {
        super(props);
        this.state = { graphData: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => {
                const logStructure = this.getLogStructure();
                if (!logStructure) {
                    return null;
                }
                return {
                    name: 'log-event-list',
                    args: { where: { logStructure } },
                };
            },
            onData: (logEvents) => this.setState({ graphData: this.processData(logEvents) }),
        });
    }

    componentDidUpdate() {
        this.dataLoader.reload();
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    getLogStructure() {
        const logStructures = this.props.search.filter((item) => item.__type__ === 'log-structure');
        if (logStructures.length === 1) {
            return logStructures[0];
        }
        return null;
    }

    // eslint-disable-next-line class-methods-use-this
    getLines(logEvent) {
        const lines = [];
        logEvent.logStructure.logKeys.forEach((logKey, index) => {
            const line = { index };
            line.name = logKey.name;
            if (logKey.type === LogStructure.Key.INTEGER) {
                line.process = parseInt;
            } else if (logKey.type === LogStructure.Key.NUMBER) {
                line.process = parseFloat;
            } else {
                return;
            }
            lines.push(line);
        });
        return lines;
    }

    // eslint-disable-next-line class-methods-use-this
    getTimeSeries(logEvents, lines) {
        if (logEvents.length === 0) {
            return [];
        }
        const dateLabelToLogEvent = {};
        logEvents.forEach((item) => {
            // TODO: Handle multiple logEvents on a single day.
            dateLabelToLogEvent[item.date] = item;
        });
        const minDate = DateUtils.getDate(Object.keys(dateLabelToLogEvent).sort()[0]);
        const maxDate = DateUtils.getTodayDate();
        const samples = [];
        for (
            let currentDate = minDate;
            compareAsc(currentDate, maxDate) < 0;
            currentDate = addDays(currentDate, 1)
        ) {
            const sample = { date: DateUtils.getLabel(currentDate) };
            const logEvent = dateLabelToLogEvent[sample.date];
            if (logEvent) {
                lines.forEach((line) => {
                    const logKey = logEvent.logStructure.logKeys[line.index];
                    if (logKey.value !== null) {
                        sample[line.index] = line.process(logKey.value);
                    }
                });
            }
            samples.push(sample);
        }
        return samples;
    }

    processData(logEvents) {
        if (!logEvents) return [];
        try {
            const lines = this.getLines(logEvents[0]);
            const samples = this.getTimeSeries(logEvents, lines);
            const ticks = null;
            // samples.map(sample => sample.date).filter(date => date.match(/^\d+-\d+-\d1$/));
            return { lines, samples, ticks };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            throw error;
        }
    }

    render() {
        const logStructure = this.getLogStructure();
        const { graphData } = this.state;
        if (!logStructure) {
            return null;
        } if (!graphData) {
            return 'Loading ...';
        }
        return graphData.lines.map((line) => (
            <ResponsiveContainer key={line.index} width="100%" height={400}>
                <LineChart
                    key={line.index}
                    data={graphData.samples}
                    margin={{
                        top: 20, right: 40, bottom: 50, left: 10,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-90} dx={-6} dy={40} ticks={graphData.ticks} />
                    <YAxis domain={['dataMin', 'dataMax']} scale="linear" />
                    <Legend />
                    <Tooltip content={CustomTooltip} />
                    <Line
                        name={line.name}
                        dataKey={line.index}
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
    search: PropTypes.arrayOf(PropTypes.Custom.Item.isRequired).isRequired,
};

export default GraphSection;
