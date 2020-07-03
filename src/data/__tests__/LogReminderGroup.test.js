import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_reminder_constraint', async () => {
    await Utils.loadData({
        logReminderGroups: [
            { name: 'Chores', type: 'deadline' },
        ],
        logReminders: [
            {
                title: 'File Taxes',
                group: 'Chores',
                deadline: '2020-07-15',
                warning: '15 days',
            },
        ],
    });

    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-reminder-group-delete', 1)).rejects.toThrow();
    await actions.invoke('log-reminder-delete', 1);
    await actions.invoke('log-reminder-group-delete', 1);
});
