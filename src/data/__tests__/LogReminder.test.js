import LogReminder from '../LogReminder';
import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_deadline', async () => {
    await Utils.bootstrap({
        logEntries: [
            {
                title: 'Important thing!',
                logReminder: {
                    type: 'deadline',
                    deadline: '{tomorrow}',
                    warning: '1 day',
                },
            },
            {
                title: 'Not very important thing',
                logReminder: {
                    type: 'deadline',
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
    await Utils.bootstrap({
        logEntries: [
            {
                title: '',
                logReminder: {
                    type: 'periodic',
                    frequency: 'everyday',
                    lastUpdate: '{today}',
                },
            },
            {
                title: 'Not very important thing',
                logReminder: {
                    type: 'periodic',
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
