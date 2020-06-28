import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_deletion_check', async () => {
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Entertainment',
                type: 'unspecified',
            },
        ],
        logEntries: [
            {
                title: 'Listen to music!',
                logReminder: { group: 'Entertainment' },
            },
        ],
    });

    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-reminder-delete', 1)).rejects.toThrow();
    await actions.invoke('log-entry-delete', 1);
    const logReminders = await actions.invoke('log-reminder-list');
    expect(logReminders.length).toEqual(0);
});

test('test_deadline_check', async () => {
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Todo',
                type: 'deadline',
            },
        ],
        logEntries: [
            {
                title: 'Important thing!',
                logReminder: {
                    group: 'Todo',
                    deadline: '{tomorrow}',
                    warning: '1 day',
                },
            },
            {
                title: 'Less important thing',
                logReminder: {
                    group: 'Todo',
                    deadline: '{+2 days}',
                    warning: '1 day',
                },
            },
        ],
    });

    const actions = Utils.getActions();
    const logReminderGroup = await actions.invoke('log-reminder-group-load', { id: 1 });
    const logEntries = await actions.invoke('reminder-list', { logReminderGroup });
    expect(logEntries.length).toEqual(1);
    expect(logEntries[0].id).toEqual(1);
});

test('test_periodic_check', async () => {
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Daily Routine',
                type: 'periodic',
            },
        ],
        logEntries: [
            {
                title: '',
                logReminder: {
                    group: 'Daily Routine',
                    frequency: 'everyday',
                    lastUpdate: '{today}',
                },
            },
            {
                title: 'Not very important thing',
                logReminder: {
                    group: 'Daily Routine',
                    frequency: 'everyday',
                    lastUpdate: '{yesterday}',
                },
            },
        ],
    });

    const actions = Utils.getActions();
    const logReminderGroup = await actions.invoke('log-reminder-group-load', { id: 1 });
    const logEntries = await actions.invoke('reminder-list', { logReminderGroup });
    expect(logEntries.length).toEqual(1);
    expect(logEntries[0].id).toEqual(2);
});

test('test_deadline_completion', async () => {
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Todo',
                type: 'deadline',
            },
        ],
        logEntries: [
            {
                title: 'Important thing!',
                logReminder: {
                    group: 'Todo',
                    deadline: '{tomorrow}',
                    warning: '1 day',
                },
            },
        ],
    });

    const actions = Utils.getActions();
    let logEntry = await actions.invoke('log-entry-load', { id: 1 });
    expect(logEntry.date).toEqual(null);
    logEntry = await actions.invoke('reminder-complete', { logEntry });
    expect(logEntry.date).not.toEqual(null);
});

test('test_periodic_completion', async () => {
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Daily Routine',
                type: 'periodic',
            },
        ],
        logEntries: [
            {
                title: 'Exercise',
                logReminder: {
                    group: 'Daily Routine',
                    frequency: 'everyday',
                    lastUpdate: '{yesterday}',
                },
            },
        ],
    });

    const actions = Utils.getActions();
    const logEntry = await actions.invoke('log-entry-load', { id: 1 });
    expect(logEntry.date).toEqual(null);
    const originalLastUpdate = logEntry.logReminder.lastUpdate;

    const newLogEntry = await actions.invoke('reminder-complete', { logEntry });
    expect(newLogEntry.id).not.toEqual(logEntry.id);
    expect(newLogEntry.date).not.toEqual(null);
    expect(newLogEntry.logReminder).toEqual(undefined); // TODO: This should be null.

    const updatedLogEntry = await actions.invoke('log-entry-load', { id: logEntry.id });
    expect(updatedLogEntry.logReminder.lastUpdate).not.toEqual(originalLastUpdate);
});
