import Utils from './Utils';
import LogEntry from '../LogEntry';
import { getTodayLabel } from '../../common/DateUtils';

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
    const logReminder = await actions.invoke('log-reminder-load', { id: 1 });
    const logEntry = LogEntry.createVirtual({ date: getTodayLabel() });
    await actions.invoke('reminder-complete', { logReminder, logEntry });

    const logReminders = await actions.invoke('log-reminder-list');
    expect(logReminders.length).toEqual(0);
});

test('test_periodic_completion', async () => {
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
    const originalLastUpdate = logReminder.lastUpdate;

    const logEntry = LogEntry.createVirtual({ date: getTodayLabel() });
    const { logReminder: updatedLogReminder } = await actions.invoke('reminder-complete', { logReminder, logEntry });
    expect(updatedLogReminder.lastUpdate).not.toEqual(originalLastUpdate);
});
