import assert from './assert';

const MS_IN_DAY = 86400 * 1000;

export function getTodayValue() {
    return new Date().valueOf();
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

export function getDateValue(label) {
    const [year, month, day] = label.split('-').map((num) => parseInt(num, 10));
    return new Date(year, month - 1, day).valueOf();
}

export function validateDateLabel(name, label) {
    return [
        name,
        !!label.match(/^\d[4]-\d[2]-\d[2]$/),
        'is an invalid date.',
    ];
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

export function validateDuration(name, duration) {
    return [
        name,
        !!duration.match(/(?:(\d+) days?)/),
        'is an invalid duration.',
    ];
}
