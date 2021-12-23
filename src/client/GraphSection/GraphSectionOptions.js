import {
    getDay, getMonth, getYear, subDays,
} from 'date-fns';
import Enum from '../../common/Enum';

import DateUtils from '../../common/DateUtils';
import { LogEventOptions } from '../LogEvent';

const Granularity = Enum([
    {
        label: 'Day',
        value: 'day',
        getLabel: (date) => DateUtils.getLabel(date),
    },
    {
        label: 'Week',
        value: 'week',
        getLabel: (date) => {
            const dayOfWeek = getDay(date);
            const startDateOfWeek = subDays(date, dayOfWeek);
            return DateUtils.getLabel(startDateOfWeek);
        },
    },
    {
        label: 'Month',
        value: 'month',
        getLabel: (date) => {
            let month = (getMonth(date) + 1).toString();
            month = (month.length === 1 ? '0' : '') + month;
            return `${getYear(date)}-${month}`;
        },
    },
]);

const GRANULARITY_TYPE = 'graph-granularity';
const GRANULARITY_PREFIX = 'Granularity: ';
const GRANULARITY_OPTIONS = Granularity.Options.map((option, index) => ({
    __type__: GRANULARITY_TYPE,
    id: -index - 1,
    name: GRANULARITY_PREFIX + option.label,
    apply: (item, _where, extra) => {
        extra.granularity = item.name.substr(GRANULARITY_PREFIX.length).toLowerCase();
    },
}));

class GraphSectionOptions {
    static get() {
        return LogEventOptions.get(null, GRANULARITY_OPTIONS);
    }

    static getEventsQuery(items) {
        const result = LogEventOptions.getEventsQuery(null, items);
        delete result.where.logLevel;
        return result;
    }
}

export { Granularity };
export default GraphSectionOptions;
