import LogReminder from '../LogReminder';
import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_deadline', async () => {
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
    let logEntry;

    logEntry = await actions.invoke('log-entry-load', { id: 1 });
    expect(LogReminder.check(logEntry.logReminder)).toEqual(true);

    logEntry = await actions.invoke('log-entry-load', { id: 2 });
    expect(LogReminder.check(logEntry.logReminder)).toEqual(false);
});

test('test_periodic', async () => {
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
    let logEntry;

    logEntry = await actions.invoke('log-entry-load', { id: 1 });
    expect(LogReminder.check(logEntry.logReminder)).toEqual(false);

    logEntry = await actions.invoke('log-entry-load', { id: 2 });
    expect(LogReminder.check(logEntry.logReminder)).toEqual(true);
});
