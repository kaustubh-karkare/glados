import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

async function checkIfReminderIsShown(date, shown) {
    const actions = Utils.getActions();
    actions.context.todayLabel = date;
    const results = await actions.invoke('reminder-sidebar');
    expect(results.length).toEqual(shown ? 1 : 0);
    delete actions.context.todayLabel;
}

test('test_reminder_without_warning', async () => {
    await Utils.loadData({
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
    await Utils.loadData({
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
    await Utils.loadData({
        logStructureGroups: [
            { name: 'Birthdays' },
        ],
        logStructures: [
            {
                groupName: 'Birthdays',
                name: 'My Birthday',
                titleTemplate: '$0',
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
    await Utils.loadData({
        logEvents: [
            {
                date: '2020-08-15',
                structureName: 'My Birthday',
            },
        ],
    });
    await checkIfReminderIsShown('2020-08-15', false);
});

test('test_reminder_for_incomplete_items', async () => {
    await Utils.loadData({
        logEvents: [
            {
                date: null,
                title: 'Read article!',
                isComplete: false,
            },
        ],
    });
    await checkIfReminderIsShown(null, true);
});
