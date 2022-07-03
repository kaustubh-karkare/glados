import { addDays, compareAsc } from 'date-fns';

import { LogKey } from '../../common/data_types';
import DateUtils from '../../common/DateUtils';
import RichTextUtils from '../../common/RichTextUtils';
import { Granularity } from './GraphSectionOptions';

function getLogKeyValues(keyIndex, valueParser, logEvents) {
    return logEvents.map((logEvent) => {
        const logKey = logEvent.logStructure.eventKeys[keyIndex];
        if (logKey.value === null) {
            return null;
        }
        return valueParser(logKey.value);
    }).filter((value) => value !== null);
}

function getAverageValue(values) {
    if (values.length === 0) {
        return null;
    } if (values.length === 1) {
        return values[0];
    }
    // logEvents[0].logStructure.eventKeys[keyIndex].aggregationType?
    return values.reduce((result, value) => (result + value), 0) / values.length;
}

function getLines(logStructure, logEvent) {
    const lines = [];
    lines.push({
        valueKey: 'event_count',
        valuesKey: 'event_count_values',
        name: 'Event Count',
        getValues: (logEvents) => [logEvents.length],
    });
    if (logStructure) {
        logEvent.logStructure.eventKeys.forEach((logKey, index) => {
            let valueParser;
            if (logKey.type === LogKey.Type.INTEGER) {
                valueParser = parseInt;
            } else if (logKey.type === LogKey.Type.NUMBER) {
                valueParser = parseFloat;
            } else if (logKey.type === LogKey.Type.TIME) {
                valueParser = (value) => parseInt(value.replace(':', ''), 10);
            } else {
                return;
            }
            lines.push({
                valueKey: `key_${logKey.__id__}_value`,
                valuesKey: `key_${logKey.__id__}_values`,
                name: `Key: ${logKey.name}`,
                getValues: getLogKeyValues.bind(null, index, valueParser),
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
        lines.forEach((line) => {
            const values = line.getValues(currentLogEvents);
            sample[line.valuesKey] = values;
            sample[line.valueKey] = getAverageValue(values);
        });
        sample.logEventTitles = currentLogEvents.map(
            (logEvent) => `${logEvent.date}: ${RichTextUtils.extractPlainText(logEvent.title)}`,
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
        return { lines, samples };
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        throw error;
    }
}
