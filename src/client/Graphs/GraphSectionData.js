import { addDays, compareAsc } from 'date-fns';

import DateUtils from '../../common/date_utils';
import { LogStructure } from '../../common/data_types';
import RichTextUtils from '../../common/rich_text_utils';
import { Granularity } from './GraphSectionOptions';

function getLogKeySample(keyIndex, valueParser, logEvents) {
    if (logEvents.length === 0) {
        return null;
    }
    const values = logEvents.map((logEvent) => {
        const logKey = logEvent.logStructure.logKeys[keyIndex];
        if (logKey.value === null) {
            return null;
        }
        return valueParser(logKey.value);
    }).filter((value) => value !== null);
    if (values.length === 0) {
        return null;
    } if (values.length === 1) {
        return values[0];
    }
    // logEvents[0].logStructure.logKeys[keyIndex].aggregationType?
    return values.reduce((result, value) => (result + value), 0) / values.length;
}

function getLines(logStructure, logEvent) {
    const lines = [];
    lines.push({
        name: 'Event Count',
        getSample: (logEvents) => logEvents.length,
    });
    if (logStructure) {
        logEvent.logStructure.logKeys.forEach((logKey, index) => {
            let valueParser;
            if (logKey.type === LogStructure.Key.Type.INTEGER) {
                valueParser = parseInt;
            } else if (logKey.type === LogStructure.Key.Type.NUMBER) {
                valueParser = parseFloat;
            } else if (logKey.type === LogStructure.Key.Type.TIME) {
                valueParser = (value) => parseInt(value.replace(':', ''), 10);
            } else {
                return;
            }
            lines.push({
                name: `Key: ${logKey.name}`,
                getSample: getLogKeySample.bind(null, index, valueParser),
            });
        });
    }
    // TODO: Add support for custom graphs?
    return lines;
}

function getTimeSeries(logEvents, lines, dateRange, granularity) {
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
    if (dateRange) {
        startDate = DateUtils.getDate(dateRange.startDate);
        endDate = DateUtils.getDate(dateRange.endDate);
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
            (logEvent) => RichTextUtils.extractPlainText(logEvent.title),
        );
        samples.push(sample);
    }
    return samples;
}

// eslint-disable-next-line import/prefer-default-export
export function getGraphData(logStructure, logEvents, dateRange, granularity) {
    if (!logEvents || !logEvents.length) return { isEmpty: true };
    try {
        const lines = getLines(logStructure, logEvents[0]);
        const samples = getTimeSeries(logEvents, lines, dateRange, granularity);
        const ticks = null;
        return { lines, samples, ticks };
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        throw error;
    }
}
