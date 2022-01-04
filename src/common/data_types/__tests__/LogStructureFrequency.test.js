import { addDays, compareAsc } from 'date-fns';

import DateUtils from '../../DateUtils';
import LogStructureFrequency from '../LogStructureFrequency';

test('test_previous_and_next_match_methods', async () => {
    // Verify the symmetry of the 2 frequency methods.
    const { todayDate } = DateUtils.getContext();
    LogStructureFrequency.Options.forEach((frequencyOption) => {
        if (frequencyOption.value === LogStructureFrequency.YEARLY) {
            return;
        }
        for (let offset = 0; offset < 7; offset += 1) {
            const startDate = addDays(todayDate, offset);
            const forwardDate = frequencyOption.getNextMatch(startDate);
            const middleDate = frequencyOption.getPreviousMatch(forwardDate);
            const backwardDate = frequencyOption.getPreviousMatch(middleDate);
            const endDate = frequencyOption.getNextMatch(backwardDate);
            expect(compareAsc(middleDate, endDate)).toEqual(0);
        }
    });

    function check(frequency, date1, method, date2, args = null) {
        const result = LogStructureFrequency[frequency][method](DateUtils.getDate(date1), args);
        expect(DateUtils.getLabel(result)).toEqual(date2);
    }
    check('everyday', '2020-07-29', 'getPreviousMatch', '2020-07-28');
    check('everyday', '2020-07-29', 'getNextMatch', '2020-07-30');
    check('weekdays', '2020-08-03', 'getPreviousMatch', '2020-07-31');
    check('weekdays', '2020-08-04', 'getPreviousMatch', '2020-08-03');
    check('weekends', '2020-07-28', 'getNextMatch', '2020-08-01');
    check('weekends', '2020-08-01', 'getNextMatch', '2020-08-02');
    check('thursday', '2020-08-01', 'getPreviousMatch', '2020-07-30');
    check('thursday', '2020-07-30', 'getNextMatch', '2020-08-06');
    check('yearly', '2020-08-15', 'getPreviousMatch', '2020-08-12', '08-12');
    check('yearly', '2020-08-12', 'getNextMatch', '2021-08-12', '08-12');
});
