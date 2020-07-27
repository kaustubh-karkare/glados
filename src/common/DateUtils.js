import assert from 'assert';

const MS_IN_DAY = 86400 * 1000;
const TODAY_OFFSET = 3 * 3600 * 1000;

// Section: Date Utilities

function getTodayDate() {
    return new Date(new Date().valueOf() - TODAY_OFFSET);
}

export function getTodayValue() {
    const now = getTodayDate();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();
}

export function getDateLabel(value) {
    const date = new Date(value);
    let result = date.getFullYear();
    result += '-';
    result += (`0${(date.getMonth() + 1).toString()}`).substr(-2);
    result += '-';
    result += (`0${date.getDate().toString()}`).substr(-2);
    return result;
}

function getRawDate(label) {
    const [year, month, day] = label.split('-').map((num) => parseInt(num, 10));
    return new Date(year, month - 1, day);
}

export function getDateValue(label) {
    return getRawDate(label).valueOf();
}

export function getTodayLabel() {
    return getDateLabel(getTodayValue());
}

export const DaysOfTheWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export function getDayOfTheWeek(label) {
    return DaysOfTheWeek[getRawDate(label).getDay()];
}

export function getTodayDay() {
    return getTodayDate().getDay();
}

// Section: Duration Utilities

export function getDurationLabel(value) {
    assert(value % MS_IN_DAY === 0);
    return `${(value / MS_IN_DAY).toString()}d`;
}

export function getDurationValue(label) {
    const regex = label.match(/(?:(\d+) days?)/);
    return parseInt(regex[1], 10) * MS_IN_DAY;
}

// Section: Range Utilities

export function getDateRange(startLabel, endLabel) {
    const startValue = getDateValue(startLabel);
    const endValue = getDateValue(endLabel);
    const results = [];
    for (let currentValue = startValue; currentValue <= endValue; currentValue += MS_IN_DAY) {
        results.push(getDateLabel(currentValue));
    }
    return results;
}

// Section: Template Utilities

export function maybeSubstitute(path, name) {
    if (typeof path[name] !== 'string') {
        // do nothing
    } else if (path[name] === '{yesterday}') {
        path[name] = getDateLabel(getTodayValue() - getDurationValue('1 day'));
    } else if (path[name] === '{today}') {
        path[name] = getDateLabel(getTodayValue());
    } else if (path[name] === '{tomorrow}') {
        path[name] = getDateLabel(getTodayValue() + getDurationValue('1 day'));
    } else {
        const match = path[name].match(/^\{([-+])(.+)\}$/);
        if (match) {
            const direction = match[1] === '+' ? 1 : -1;
            const duration = match[2];
            path[name] = getDateLabel(getTodayValue() + direction * getDurationValue(duration));
        }
    }
}
