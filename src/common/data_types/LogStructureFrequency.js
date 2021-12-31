import {
    addDays, addYears,
    compareAsc,
    getDay,
    isFriday, isMonday, isSaturday, isSunday,
    setDate, setMonth,
    subDays, subYears,
} from 'date-fns';
import DateUtils from '../DateUtils';
import Enum from './enum';

const FrequencyRawOptions = [
    {
        value: 'everyday',
        label: 'Everyday',
        getPreviousMatch(date) {
            return subDays(date, 1);
        },
        getNextMatch(date) {
            return addDays(date, 1);
        },
    },
    {
        value: 'weekdays',
        label: 'Weekdays',
        getPreviousMatch(date) {
            if (isMonday(date)) {
                return subDays(date, 3);
            } if (isSunday(date)) {
                return subDays(date, 2);
            }
            return subDays(date, 1);
        },
        getNextMatch(date) {
            if (isFriday(date)) {
                return addDays(date, 3);
            } if (isSaturday(date)) {
                return addDays(date, 2);
            }
            return addDays(date, 1);
        },
    },
    {
        value: 'weekends',
        label: 'Weekends',
        getPreviousMatch(date) {
            if (isSunday(date)) {
                return subDays(date, 1);
            }
            return subDays(date, getDay(date));
        },
        getNextMatch(date) {
            if (isSaturday(date)) {
                return addDays(date, 1);
            }
            return addDays(date, 6 - getDay(date));
        },
    },
    // TODO: Add more as needed.
];

DateUtils.DaysOfTheWeek.forEach((day, index) => {
    FrequencyRawOptions.push({
        value: day.toLowerCase(),
        label: day,
        getPreviousMatch(date) {
            const diff = (getDay(date) - index + 7) % 7;
            return subDays(date, diff || 7);
        },
        getNextMatch(date) {
            const diff = (index - getDay(date) + 7) % 7;
            return addDays(date, diff || 7);
        },
    });
});

function parseYearlyFrequencyArgs(args) {
    let [month, dayOfTheMonth] = args.split('-');
    month = parseInt(month, 10) - 1; // 0 = January
    dayOfTheMonth = parseInt(dayOfTheMonth, 10);
    return { month, dayOfTheMonth };
}

FrequencyRawOptions.push({
    value: 'yearly',
    label: 'Yearly',
    getPreviousMatch(date, args) {
        const { month, dayOfTheMonth } = parseYearlyFrequencyArgs(args);
        let target = setDate(setMonth(date, month), dayOfTheMonth);
        if (compareAsc(date, target) <= 0) {
            target = subYears(target, 1);
        }
        return target;
    },
    getNextMatch(date, args) {
        const { month, dayOfTheMonth } = parseYearlyFrequencyArgs(args);
        let target = setDate(setMonth(date, month), dayOfTheMonth);
        if (compareAsc(date, target) >= 0) {
            target = addYears(target, 1);
        }
        return target;
    },
});

export default Enum(FrequencyRawOptions);
