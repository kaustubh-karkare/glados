import Utils from './Utils';
import LogEntry from '../LogEntry';
import LogStructure from '../LogStructure';
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

test('test_reminder_structure_upsert', async () => {
    await Utils.loadData({
        logReminderGroups: [
            {
                name: 'Todo',
                type: 'unspecified',
            },
        ],
        logReminders: [
            {
                title: 'Read a book',
                group: 'Todo',
            },
        ],
    });

    const actions = Utils.getActions();
    let logReminder = await actions.invoke('log-reminder-load', { id: 1 });
    let logStructures;

    logReminder.logStructure = LogStructure.createVirtual({ name: 'One', isIndirectlyManaged: true });
    logReminder = await actions.invoke('log-reminder-upsert', logReminder);
    logStructures = await actions.invoke('log-structure-list');
    expect(logStructures.length).toEqual(1);

    logReminder.logStructure = LogStructure.createVirtual({ name: 'Two', isIndirectlyManaged: true });
    logReminder = await actions.invoke('log-reminder-upsert', logReminder);
    logStructures = await actions.invoke('log-structure-list');
    expect(logStructures.length).toEqual(1);

    logReminder = await actions.invoke('log-reminder-delete', logReminder.id);
    logStructures = await actions.invoke('log-structure-list');
    expect(logStructures.length).toEqual(0);
});
