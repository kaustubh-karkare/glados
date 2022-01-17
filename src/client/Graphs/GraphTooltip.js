import PropTypes from 'prop-types';
import React from 'react';

const NormalTooltip = ({ active, label, payload }) => {
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

NormalTooltip.propTypes = {
    active: PropTypes.bool,
    label: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    payload: PropTypes.any,
};

// eslint-disable-next-line import/prefer-default-export
export { NormalTooltip };
