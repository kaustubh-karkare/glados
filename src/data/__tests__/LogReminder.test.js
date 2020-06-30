import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_deadline_check', async () => {
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Todo',
                type: 'deadline',
            },
        ],
        logReminders: [
            {
                title: 'Important thing!',
                group: 'Todo',
                deadline: '{tomorrow}',
                warning: '1 day',
            },
            {
                title: 'Less important thing',
                group: 'Todo',
                deadline: '{+2 days}',
                warning: '1 day',
            },
        ],
    });

    const actions = Utils.getActions();
    const logReminders = await actions.invoke('log-reminder-list', {
        selector: { group_id: 1 },
        isActive: true,
    });
    expect(logReminders.length).toEqual(1);
    expect(logReminders[0].id).toEqual(1);
});

test('test_periodic_check', async () => {
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Daily Routine',
                type: 'periodic',
            },
        ],
        logReminders: [
            {
                title: '',
                group: 'Daily Routine',
                frequency: 'everyday',
                lastUpdate: '{today}',
            },
            {
                title: 'Not very important thing',
                group: 'Daily Routine',
                frequency: 'everyday',
                lastUpdate: '{yesterday}',
            },
        ],
    });

    const actions = Utils.getActions();
    const logReminders = await actions.invoke('log-reminder-list', {
        selector: { group_id: 1 },
        isActive: true,
    });
    expect(logReminders.length).toEqual(1);
    expect(logReminders[0].id).toEqual(2);
});

test('test_deadline_completion', async () => {
    return;
    // eslint-disable-next-line no-unreachable
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Todo',
                type: 'deadline',
            },
        ],
        logReminders: [
            {
                title: 'Important thing!',
                group: 'Todo',
                deadline: '{tomorrow}',
                warning: '1 day',
            },
        ],
    });

    const actions = Utils.getActions();
    let logReminder = await actions.invoke('log-reminder-load', { id: 1 });
    expect(logReminder.date).toEqual(null);
    logReminder = await actions.invoke('reminder-complete', { logReminder });
    expect(logReminder.date).not.toEqual(null);
});

test('test_periodic_completion', async () => {
    return;
    // eslint-disable-next-line no-unreachable
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Daily Routine',
                type: 'periodic',
            },
        ],
        logReminders: [
            {
                title: 'Exercise',
                group: 'Daily Routine',
                frequency: 'everyday',
                lastUpdate: '{yesterday}',
            },
        ],
    });

    const actions = Utils.getActions();
    const logReminder = await actions.invoke('log-reminder-load', { id: 1 });
    expect(logReminder.date).toEqual(null);
    const originalLastUpdate = logReminder.logReminder.lastUpdate;

    const newLogReminder = await actions.invoke('reminder-complete', { logReminder });
    expect(newLogReminder.id).not.toEqual(logReminder.id);
    expect(newLogReminder.date).not.toEqual(null);
    expect(newLogReminder.logReminder).toEqual(undefined); // TODO: This should be null.

    const updatedLogReminder = await actions.invoke('log-reminder-load', { id: logReminder.id });
    expect(updatedLogReminder.logReminder.lastUpdate).not.toEqual(originalLastUpdate);
});
