import { addDays, compareAsc } from 'date-fns';

import DateUtils from '../../common/DateUtils';
import { LogStructure } from '../../data';
import TextEditorUtils from '../../common/TextEditorUtils';
import { Granularity } from './GraphSectionOptions';

function getLogKeySample(keyIndex, valueParser, logEvents) {
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

function getLines(logEvent) {
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
            getSample: getLogKeySample.bind(null, index, valueParser),
        });
    });
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
            (logEvent) => TextEditorUtils.extractPlainText(logEvent.title),
        );
        samples.push(sample);
    }
    return samples;
}

// eslint-disable-next-line import/prefer-default-export
export function getGraphData(logEvents, dateRange, granularity) {
    if (!logEvents || !logEvents.length) return { isEmpty: true };
    try {
        const lines = getLines(logEvents[0]);
        const samples = getTimeSeries(logEvents, lines, dateRange, granularity);
        const ticks = null;
        return { lines, samples, ticks };
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        throw error;
    }
}
