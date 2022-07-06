import TestUtils from './TestUtils';

beforeEach(TestUtils.beforeEach);
afterEach(TestUtils.afterEach);

async function checkIfReminderIsShown(todayLabel, shown) {
    const actions = TestUtils.getActions();
    const results = await actions.invoke('reminder-sidebar', { todayLabel });
    expect(results.length).toEqual(shown ? 1 : 0);
}

test('test_reminder_without_warning', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'Daily Routine' },
        ],
        logStructures: [
            {
                groupName: 'Daily Routine',
                name: 'Exercise',
                isPeriodic: true,
                frequency: 'everyday',
                warningDays: 0,
                suppressUntilDate: '2020-08-07',
            },
        ],
    });
    await checkIfReminderIsShown('2020-08-08', true);
    await TestUtils.loadData({
        logEvents: [
            {
                date: '2020-08-08',
                structureName: 'Exercise',
            },
        ],
    });
    await checkIfReminderIsShown('2020-08-08', false);
});

test('test_reminder_with_warning', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'Birthdays' },
        ],
        logStructures: [
            {
                groupName: 'Birthdays',
                name: 'My Birthday',
                eventTitleTemplate: '$0',
                isPeriodic: true,
                frequency: 'yearly',
                frequencyArgs: '08-12',
                warningDays: 7,
                suppressUntilDate: '2020-01-01',
            },
        ],
        logEvents: [
            {
                date: '2019-08-12',
                structureName: 'My Birthday',
            },
        ],
    });
    await checkIfReminderIsShown('2020-08-01', false);
    await checkIfReminderIsShown('2020-08-05', true);
    await checkIfReminderIsShown('2020-08-12', true);
    await checkIfReminderIsShown('2020-08-15', true);
    await TestUtils.loadData({
        logEvents: [
            {
                date: '2020-08-15',
                structureName: 'My Birthday',
            },
        ],
    });
    await checkIfReminderIsShown('2020-08-15', false);
});

async function checkReminderScore(todayLabel, value, deadline) {
    const actions = TestUtils.getActions();
    const logStructure = await actions.invoke('log-structure-load', { __id__: 1 });
    const score = await actions.invoke('reminder-score', { logStructure, todayLabel });
    expect(score.value).toEqual(value);
    expect(score.deadline).toEqual(deadline);
}

test('test_reminder_score', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'Weekly' },
        ],
        logStructures: [
            {
                groupName: 'Weekly',
                name: 'Weekly Report',
                isPeriodic: true,
                frequency: 'friday',
                warningDays: 2, // warning starts on wednesday
                suppressUntilDate: '2020-08-20',
            },
        ],
    });
    const addEvent = (date) => TestUtils.loadData({
        logEvents: [{ date, structureName: 'Weekly Report' }],
    });
    await checkReminderScore('2020-08-15', 0, null);
    await checkReminderScore('2020-08-20', 0, null);
    // week 1: event date = reminder date
    await addEvent('2020-08-21'); // friday
    await checkReminderScore('2020-08-21', 1, null); // friday
    // week 2: event date < reminder date
    await checkReminderScore('2020-08-25', 1, null); // tuesday
    await checkReminderScore('2020-08-26', 1, '2020-09-01'); // wednesday
    await addEvent('2020-08-27'); // thursday
    await checkReminderScore('2020-08-28', 2, null); // friday
    // week 3: event date > reminder date
    await checkReminderScore('2020-09-04', 2, '2020-09-08'); // friday
    await addEvent('2020-09-05'); // saturday
    // week 4
    await checkReminderScore('2020-09-06', 3, null); // sunday
    await checkReminderScore('2020-09-11', 3, '2020-09-15'); // friday
    // week 5
    await checkReminderScore('2020-09-18', -1, '2020-09-22'); // friday
    // week 6
    await checkReminderScore('2020-09-25', -2, '2020-09-29'); // friday
    await addEvent('2020-09-25'); // friday
    await checkReminderScore('2020-09-26', 1, null); // saturday
});
