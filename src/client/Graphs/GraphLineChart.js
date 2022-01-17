import React from 'react';
import {
    CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts';

import PropTypes from '../prop-types';

function GraphLineChart(props) {
    const lineElements = props.lines.map((lineItem) => (
        <Line
            key={lineItem.name}
            name={lineItem.name}
            dataKey={lineItem.dataKey}
            type="monotone"
            stroke={lineItem.color || '#00bc8c'}
            connectNulls
            isAnimationActive={false}
        />
    ));
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={props.samples}
                margin={{
                    top: 20, right: 40, bottom: 50, left: 10,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" angle={-90} dx={-6} dy={40} />
                <YAxis domain={['dataMin', 'dataMax']} scale="linear" />
                <Legend />
                {props.tooltip ? <Tooltip content={props.tooltip} /> : null}
                {lineElements}
            </LineChart>
        </ResponsiveContainer>
    );
}

const LineItem = PropTypes.shape({
    name: PropTypes.string.isRequired,
    dataKey: PropTypes.string.isRequired,
});

GraphLineChart.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    samples: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
    lines: PropTypes.arrayOf(LineItem.isRequired).isRequired,
    tooltip: PropTypes.func,
};

export default GraphLineChart;
