import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_reminder_constraint', async () => {
    await Utils.loadData({
        logReminderGroups: [
            { name: 'Routine', type: 'periodic' },
        ],
        logEntries: [
            {
                title: 'Exercise',
                logReminder: {
                    group: 'Routine',
                    frequency: 'everyday',
                    lastUpdate: '2020-06-26',
                },
            },
        ],
    });

    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-reminder-group-delete', 1)).rejects.toThrow();
    await actions.invoke('log-reminder-delete', 1);
    await actions.invoke('log-reminder-group-delete', 1);
});
