import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_reminder_sidebar', async () => {
    await Utils.loadData({
        logStructureGroups: [
            { name: 'Daily Routine' },
            { name: 'Entertainment' },
        ],
        logStructures: [
            {
                groupName: 'Daily Routine',
                name: 'Exercise',
                isPeriodic: true,
                frequency: 'everyday',
                lastUpdate: '{yesterday}',
            },
            {
                groupName: 'Daily Routine',
                name: 'Cooking',
                isPeriodic: true,
                frequency: 'everyday',
                lastUpdate: '{today}',
            },
            {
                groupName: 'Entertainment',
                name: 'Movie',
                logKeys: [
                    { name: 'Movie Name', type: 'string' },
                ],
                titleTemplate: '$0: $1',
            },
        ],
        logEvents: [
            {
                date: '{+2 days}',
                title: 'Read article!',
                isComplete: false,
            },
            {
                date: null,
                structureName: 'Movie',
                logValues: ['Limitless'],
                isComplete: false,
            },
        ],
    });

    const actions = Utils.getActions();
    const results = await actions.invoke('reminder-sidebar');
    expect(results.length).toEqual(2);
    expect(results[0].items.length).toEqual(1);
    expect(results[1].items.length).toEqual(2);
});
