import { addDays, compareAsc } from 'date-fns';
import { LogStructure } from '..';
import DateUtils from '../../common/DateUtils';

test('test_frequency_previous_and_next_match_methods', async () => {
    // Verify the symmetry of the 2 frequency methods.
    const { Frequency } = LogStructure;
    const today = DateUtils.getTodayDate();
    Frequency.Options.forEach((frequencyOption) => {
        for (let offset = 0; offset < 7; offset += 1) {
            const start = addDays(today, offset);
            const forward = frequencyOption.getNextMatch(start);
            const middle = frequencyOption.getPreviousMatch(forward);
            const backward = frequencyOption.getPreviousMatch(middle);
            const end = frequencyOption.getNextMatch(backward);
            expect(compareAsc(middle, end)).toEqual(0);
        }
    });

    function check(frequency, date1, method, date2) {
        const result = Frequency[frequency][method](DateUtils.getDate(date1));
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
});
