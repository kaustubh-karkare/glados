import { LogStructure } from '../../data';
import TextEditorUtils from '../../common/TextEditorUtils';
import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_key_updates', async () => {
    await Utils.loadData({
        logModes: [
            { name: 'Test' },
        ],
        logStructureGroups: [
            {
                modeName: 'Test',
                name: 'Entertainment',
            },
        ],
        logStructures: [
            {
                groupName: 'Entertainment',
                name: 'Movie',
                logKeys: [
                    { name: 'Title', type: 'string' },
                    { name: 'Link', type: 'string' },
                    { name: 'Rating', type: 'integer' },
                ],
                titleTemplate: '$0: [$1]($2)',
            },
        ],
        logEvents: [
            {
                date: '2020-08-23',
                structureName: 'Movie',
                logValues: ['The Martian', 'https://www.imdb.com/title/tt3659388/', '9'],
            },
        ],
    });

    const actions = Utils.getActions();

    const oldLogEvent = await actions.invoke('log-event-load', { id: 1 });
    const oldValues = oldLogEvent.logStructure.logKeys.map((logKey) => logKey.value);

    const logStructure = await actions.invoke('log-structure-load', { id: 1 });
    const newLogKey = {
        ...LogStructure.createNewKey(),
        name: 'Worthwhile?',
        type: LogStructure.Key.YES_OR_NO,
        value: 'yes',
    };
    logStructure.logKeys = [
        logStructure.logKeys[1],
        logStructure.logKeys[0],
        newLogKey,
    ];
    await actions.invoke('log-structure-upsert', logStructure);

    const newLogEvent = await actions.invoke('log-event-load', { id: 1 });
    const newValues = newLogEvent.logStructure.logKeys.map((logKey) => logKey.value);
    expect(newValues[0]).toEqual(oldValues[1]);
    expect(newValues[1]).toEqual(oldValues[0]);
    expect(newValues[2]).toEqual(newLogKey.value);
});

test('test_structure_deletion', async () => {
    await Utils.loadData({
        logModes: [
            { name: 'Test' },
        ],
        logStructureGroups: [
            { modeName: 'Test', name: 'Misc' },
        ],
        logStructures: [
            {
                groupName: 'Misc',
                name: 'Testingwa',
                titleTemplate: '$0',
            },
        ],
    });
    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-topic-delete', 1)).rejects.toThrow();
    await actions.invoke('log-structure-delete', 1);
    const logTopics = await actions.invoke('log-topic-list');
    expect(logTopics.length).toEqual(0);
});

test('test_structure_title_template_expression', async () => {
    await Utils.loadData({
        logModes: [
            { name: 'Test' },
        ],
        logStructureGroups: [
            {
                modeName: 'Test',
                name: 'Exercise',
            },
        ],
        logStructures: [
            {
                groupName: 'Exercise',
                name: 'Cycling',
                logKeys: [
                    { name: 'Distance (miles)', type: 'integer' },
                    { name: 'Time (minutes)', type: 'integer' },
                ],
                titleTemplate: '$0: $1 miles / $2 minutes',
            },
        ],
        logEvents: [
            {
                date: '2020-06-26',
                structureName: 'Cycling',
                logValues: ['15', '60'],
            },
            {
                date: '2020-06-27',
                structureName: 'Cycling',
                logValues: ['15', '55'],
            },
            {
                date: '2020-06-28',
                structureName: 'Cycling',
                logValues: ['15', '50'],
            },
        ],
    });

    const actions = Utils.getActions();
    let logEvents = await actions.invoke('log-event-list');
    expect(logEvents[0].name).toEqual('Cycling: 15 miles / 60 minutes');
    expect(logEvents[1].name).toEqual('Cycling: 15 miles / 55 minutes');
    expect(logEvents[2].name).toEqual('Cycling: 15 miles / 50 minutes');

    const { logStructure } = logEvents[0];
    logStructure.titleTemplate = TextEditorUtils.convertPlainTextToDraftContent(
        '$0: $1 miles / $2 minutes ({($1*60/$2).toFixed(2)} mph)',
        { $: [logStructure, ...logStructure.logKeys] },
    );
    await actions.invoke('log-structure-upsert', logStructure);

    logEvents = await actions.invoke('log-event-list');
    expect(logEvents[0].name).toEqual('Cycling: 15 miles / 60 minutes (15.00 mph)');
    expect(logEvents[1].name).toEqual('Cycling: 15 miles / 55 minutes (16.36 mph)');
    expect(logEvents[2].name).toEqual('Cycling: 15 miles / 50 minutes (18.00 mph)');
});

test('test_structure_title_template_link', async () => {
    await Utils.loadData({
        logModes: [
            { name: 'Test' },
        ],
        logStructureGroups: [
            {
                modeName: 'Test',
                name: 'Education',
            },
        ],
        logStructures: [
            {
                groupName: 'Education',
                name: 'Article',
                logKeys: [
                    { name: 'Title', type: 'string' },
                    { name: 'Link', type: 'string' },
                ],
                titleTemplate: '$0: [$1]($2)',
            },
        ],
        logEvents: [
            {
                date: '2020-08-23',
                structureName: 'Article',
                logValues: ['Facebook', 'https://facebook.com'],
            },
        ],
    });

    const actions = Utils.getActions();
    const logEvents = await actions.invoke('log-event-list');
    expect(logEvents[0].name).toEqual('Article: Facebook');
});

test('test_structure_with_topic', async () => {
    await Utils.loadData({
        logModes: [
            { name: 'Test' },
        ],
        logTopics: [
            { modeName: 'Test', name: 'Books' },
            { modeName: 'Test', name: 'Harry Potter', parentTopicName: 'Books' },
            { modeName: 'Test', name: 'Foundation', parentTopicName: 'Books' },
        ],
        logStructureGroups: [
            { modeName: 'Test', name: 'Education' },
        ],
        logStructures: [
            {
                groupName: 'Education',
                name: 'Reading',
                logKeys: [
                    { name: 'Book', type: 'log_topic', parentTopicName: 'Books' },
                    { name: 'Progress', type: 'string' },
                ],
                titleTemplate: '$0: $1 ($2)',
            },
        ],
        logEvents: [
            {
                date: '2020-07-23',
                structureName: 'Reading',
                logValues: ['Harry Potter', '60'],
            },
        ],
    });

    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-topic-delete', 2)).rejects.toThrow();
    const logEvent = await actions.invoke('log-event-load', { id: 1 });
    logEvent.logStructure.logKeys[0].value = await actions.invoke('log-topic-load', { id: 3 });
    await actions.invoke('log-event-upsert', logEvent);
    await actions.invoke('log-topic-delete', 2);
});
