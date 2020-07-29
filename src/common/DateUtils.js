import assert from 'assert';
import {
    addDays, format, isValid, parse, set, subDays,
} from 'date-fns';

const TODAY_OFFSET = 3 * 3600 * 1000;
const LABEL_FORMAT = 'yyyy-MM-dd';
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

DateUtils.DaysOfTheWeek = DaysOfTheWeek;

export default DateUtils;
