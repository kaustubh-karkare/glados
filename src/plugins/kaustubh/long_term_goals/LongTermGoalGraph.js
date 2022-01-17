import {
    addDays, compareAsc, differenceInDays,
} from 'date-fns';
import React from 'react';

import { DateContext } from '../../../client/Common';
import { getGraphData, Granularity, GraphLineChart } from '../../../client/Graphs';
import PropTypes from '../../../client/prop-types';
import DateUtils from '../../../common/DateUtils';

const CURRENT_KEY = '__current__';
const TARGET_KEY = '__target__';

const CustomTooltip = ({ active, label, payload }) => {
    if (active && payload && payload.length) {
        const output = [];
        output.push(`Date: ${label}`);
        payload.forEach((item) => {
            output.push(`${item.name}: ${item.payload[item.dataKey]}`);
        });
        const { logEventTitles } = payload[0].payload;
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

class LongTermGoalGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = { graphData: null };
    }

    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        this.setState({ graphData: null });
        const { goal } = this.props;
        const granularity = Granularity.DAY;

        // Standard Graph Calculations
        const dateRange = { ...goal.dateRange, endDate: this.props.todayDate };
        const where = { date: dateRange, logStructure: goal.logStructure };
        const logEvents = await window.api.send('log-event-list', { where });
        const graphData = getGraphData(
            goal.logStructure,
            logEvents,
            goal.dateRange,
            granularity,
        );

        // Replace lines.
        const selectedLine = graphData.lines.find((line) => line.name === goal.keyLabel);
        graphData.lines = [
            { name: goal.newLabel, dataKey: CURRENT_KEY },
            { name: 'Target', dataKey: TARGET_KEY, color: 'var(--link-color)' },
        ];

        // Limit samples to today.
        graphData.samples = graphData.samples.filter((sample) => {
            const sampleDate = DateUtils.getDate(sample.label);
            return compareAsc(sampleDate, this.props.todayDate) <= 0;
        });

        // Compute progress and prorated target.
        const startDate = DateUtils.getDate(goal.dateRange.startDate);
        const endDate = DateUtils.getDate(goal.dateRange.endDate);
        const totalDays = differenceInDays(endDate, startDate) + 1;
        let partialSum = 0;
        graphData.samples.forEach((sample) => {
            const sampleDate = DateUtils.getDate(sample.label);
            let nextSampleDate = addDays(sampleDate, 1);
            const getGroupLabel = Granularity[granularity].getLabel;
            while (getGroupLabel(sampleDate) === getGroupLabel(nextSampleDate)) {
                nextSampleDate = addDays(nextSampleDate, 1);
            }
            let dayCount = differenceInDays(nextSampleDate, startDate);
            dayCount = Math.max(dayCount, 0);
            dayCount = Math.min(dayCount, totalDays);
            sample[TARGET_KEY] = (parseFloat(goal.target) * (dayCount / totalDays)).toFixed(2);
            if (compareAsc(sampleDate, this.props.todayDate) <= 0) {
                partialSum += sample[selectedLine.valuesKey]
                    .reduce((result, value) => (result + value), 0);
                sample[CURRENT_KEY] = partialSum;
                // Only the last color assigned is applicable.
                graphData.lines[0].color = sample[CURRENT_KEY] >= sample[TARGET_KEY] ? 'var(--topic-color)' : 'var(--warning-color)';
            }
        });

        // Additional Props
        graphData.tooltip = CustomTooltip;
        this.setState({ graphData });
    }

    render() {
        const { graphData } = this.state;
        return graphData ? <GraphLineChart {...graphData} /> : null;
    }
}

LongTermGoalGraph.propTypes = {
    todayDate: PropTypes.instanceOf(Date).isRequired,
    goal: PropTypes.shape({
        logStructure: PropTypes.Custom.Item.isRequired,
        keyLabel: PropTypes.string.isRequired,
        newLabel: PropTypes.string.isRequired,
        dateRange: PropTypes.Custom.DateRange.isRequired,
        target: PropTypes.string.isRequired,
    }).isRequired,
};

export default DateContext.Wrapper(LongTermGoalGraph);
