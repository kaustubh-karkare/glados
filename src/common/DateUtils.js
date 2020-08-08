import assert from 'assert';
import {
    addDays, format, isValid, parse, set, subDays,
} from 'date-fns';

const TODAY_OFFSET = 3 * 3600 * 1000;
const LABEL_FORMAT = 'yyyy-MM-dd';
const MonthsOfTheYear = [
    { name: 'January', days: 31 },
    { name: 'February', days: 29 },
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 },
];
const DaysOfTheWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const timeValues = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
};

// Section: Date Utilities

class DateUtils {
    static getTodayDate() {
        return set(new Date(new Date().valueOf() - TODAY_OFFSET), timeValues);
    }

    static getTodayLabel() {
        return DateUtils.getLabel(DateUtils.getTodayDate());
    }

    static getDate(label) {
        return set(parse(label, LABEL_FORMAT, new Date()), timeValues);
    }

    static getLabel(date) {
        return format(date, LABEL_FORMAT);
    }

    static maybeSubstitute(path, name) {
        if (typeof path[name] !== 'string') {
            // do nothing
        } else if (path[name] === '{yesterday}') {
            path[name] = DateUtils.getLabel(subDays(DateUtils.getTodayDate(), 1));
        } else if (path[name] === '{today}') {
            path[name] = DateUtils.getTodayLabel();
        } else if (path[name] === '{tomorrow}') {
            path[name] = DateUtils.getLabel(addDays(DateUtils.getTodayDate(), 1));
        } else if (!isValid(DateUtils.getDate(path[name]))) {
            assert(false, path[name]);
        }
    }
}

DateUtils.MonthsOfTheYear = MonthsOfTheYear;
DateUtils.DaysOfTheWeek = DaysOfTheWeek;

export default DateUtils;
