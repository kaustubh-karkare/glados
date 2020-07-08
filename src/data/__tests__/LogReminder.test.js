import Utils from './Utils';
import LogEvent from '../LogEvent';
import { getTodayLabel } from '../../common/DateUtils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_deadline_check', async () => {
    await Utils.loadData({
        logTopics: [
            { name: 'Todo' },
        ],
        logReminders: [
            {
                title: 'Important thing!',
                parentTopicName: 'Todo',
                type: 'deadline',
                deadline: '{tomorrow}',
                warning: '1 day',
            },
            {
                title: 'Less important thing',
                parentTopicName: 'Todo',
                type: 'deadline',
                deadline: '{+2 days}',
                warning: '1 day',
            },
        ],
    });

    const actions = Utils.getActions();
    const logReminders = await actions.invoke('log-reminder-list', {
        isActive: true,
    });
    expect(logReminders.length).toEqual(1);
    expect(logReminders[0].id).toEqual(1);
});

test('test_periodic_check', async () => {
    await Utils.loadData({
        logStructures: [
            { name: 'Things' },
        ],
        logTopics: [
            { name: 'Daily Routine' },
        ],
        logReminders: [
            {
                title: 'Very important thing',
                parentTopicName: 'Daily Routine',
                type: 'periodic',
                frequency: 'everyday',
                lastUpdate: '{today}',
                structure: 'Things',
            },
            {
                title: 'Not very important thing',
                parentTopicName: 'Daily Routine',
                type: 'periodic',
                frequency: 'everyday',
                lastUpdate: '{yesterday}',
                structure: 'Things',
            },
        ],
    });

    const actions = Utils.getActions();
    const logReminders = await actions.invoke('log-reminder-list', {
        isActive: true,
    });
    expect(logReminders.length).toEqual(1);
    expect(logReminders[0].id).toEqual(2);
});

test('test_deadline_completion', async () => {
    await Utils.loadData({
        logTopics: [
            { name: 'Todo' },
        ],
        logReminders: [
            {
                title: 'Important thing!',
                parentTopicName: 'Todo',
                type: 'deadline',
                deadline: '{tomorrow}',
                warning: '1 day',
            },
        ],
    });

    const actions = Utils.getActions();
    const logReminder = await actions.invoke('log-reminder-load', { id: 1 });
    const logEvent = LogEvent.createVirtual({ date: getTodayLabel(), title: logReminder.title });
    await actions.invoke('reminder-complete', { logReminder, logEvent });

    const logReminders = await actions.invoke('log-reminder-list');
    expect(logReminders.length).toEqual(0);
});

test('test_periodic_completion', async () => {
    await Utils.loadData({
        logStructures: [
            { name: 'Things' },
        ],
        logTopics: [
            { name: 'Daily Routine' },
        ],
        logReminders: [
            {
                title: 'Important thing!',
                parentTopicName: 'Daily Routine',
                type: 'periodic',
                frequency: 'everyday',
                lastUpdate: '{yesterday}',
                structure: 'Things',
            },
        ],
    });

    const actions = Utils.getActions();
    const logReminder = await actions.invoke('log-reminder-load', { id: 1 });
    const logStructure = await actions.invoke('log-structure-load', { id: 1 });
    const originalLastUpdate = logReminder.lastUpdate;
    const logEvent = LogEvent.createVirtual({ date: getTodayLabel(), logStructure });
    const { logReminder: updatedLogReminder } = await actions.invoke('reminder-complete', { logReminder, logEvent });
    expect(updatedLogReminder.lastUpdate).not.toEqual(originalLastUpdate);
});
