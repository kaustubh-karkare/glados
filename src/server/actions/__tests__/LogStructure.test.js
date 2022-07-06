import { LogKey } from '../../../common/data_types';
import RichTextUtils from '../../../common/RichTextUtils';
import TestUtils from './TestUtils';

beforeEach(TestUtils.beforeEach);
afterEach(TestUtils.afterEach);

test('test_key_updates', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'Entertainment' },
        ],
        logStructures: [
            {
                groupName: 'Entertainment',
                name: 'Movie',
                eventKeys: [
                    { name: 'Title', type: 'string' },
                    { name: 'Link', type: 'string' },
                    { name: 'Rating', type: 'integer' },
                ],
                eventeventTitleTemplate: '$0: [$1]($2)',
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

    const actions = TestUtils.getActions();

    const oldLogEvent = await actions.invoke('log-event-load', { __id__: 1 });
    const oldValues = oldLogEvent.logStructure.eventKeys.map((logKey) => logKey.value);

    const logStructure = await actions.invoke('log-structure-load', { __id__: 1 });
    const newLogKey = {
        ...LogKey.createVirtual(),
        name: 'Worthwhile?',
        type: LogKey.Type.YES_OR_NO,
        value: 'yes',
    };
    logStructure.eventKeys = [
        logStructure.eventKeys[1],
        logStructure.eventKeys[0],
        newLogKey,
    ];
    await actions.invoke('log-structure-upsert', logStructure);

    const newLogEvent = await actions.invoke('log-event-load', { __id__: 1 });
    const newValues = newLogEvent.logStructure.eventKeys.map((logKey) => logKey.value);
    expect(newValues[0]).toEqual(oldValues[1]);
    expect(newValues[1]).toEqual(oldValues[0]);
    expect(newValues[2]).toEqual(newLogKey.value);
});

test('test_structure_deletion', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'Misc' },
        ],
        logStructures: [
            {
                groupName: 'Misc',
                name: 'Testingwa',
                eventTitleTemplate: '$0',
            },
        ],
    });
    const actions = TestUtils.getActions();
    await expect(() => actions.invoke('log-topic-delete', 1)).rejects.toThrow();
    await actions.invoke('log-structure-delete', 1);
    const logTopics = await actions.invoke('log-topic-list');
    expect(logTopics.length).toEqual(0);
});

test('test_structure_title_template_expression', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'Exercise' },
        ],
        logStructures: [
            {
                groupName: 'Exercise',
                name: 'Cycling',
                eventKeys: [
                    { name: 'Distance (miles)', type: 'integer' },
                    { name: 'Time (minutes)', type: 'integer' },
                ],
                eventTitleTemplate: '$0: $1 miles / $2 minutes',
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

    const actions = TestUtils.getActions();
    let logEvents = await actions.invoke('log-event-list');
    expect(logEvents.map((logEvent) => RichTextUtils.extractPlainText(logEvent.title))).toEqual([
        'Cycling: 15 miles / 60 minutes',
        'Cycling: 15 miles / 55 minutes',
        'Cycling: 15 miles / 50 minutes',
    ]);

    const { logStructure } = logEvents[0];
    logStructure.eventTitleTemplate = RichTextUtils.convertPlainTextToDraftContent(
        '$0: $1 miles / $2 minutes ({($1*60/$2).toFixed(2)} mph)',
        { $: [logStructure, ...logStructure.eventKeys] },
    );
    await actions.invoke('log-structure-upsert', logStructure);

    logEvents = await actions.invoke('log-event-list');
    expect(logEvents.map((logEvent) => RichTextUtils.extractPlainText(logEvent.title))).toEqual([
        'Cycling: 15 miles / 60 minutes (15.00 mph)',
        'Cycling: 15 miles / 55 minutes (16.36 mph)',
        'Cycling: 15 miles / 50 minutes (18.00 mph)',
    ]);
});

test('test_structure_title_template_link', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'Education' },
        ],
        logStructures: [
            {
                groupName: 'Education',
                name: 'Article',
                eventKeys: [
                    { name: 'Title', type: 'string' },
                    { name: 'Link', type: 'string' },
                ],
                eventTitleTemplate: '$0: [$1]($2)',
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

    const actions = TestUtils.getActions();
    const logEvents = await actions.invoke('log-event-list');
    expect(RichTextUtils.extractPlainText(logEvents[0].title)).toEqual('Article: Facebook');
});

test('test_structure_with_topic', async () => {
    await TestUtils.loadData({
        logTopics: [
            { name: 'Books' },
            { name: 'Harry Potter', parentTopicName: 'Books' },
            { name: 'Foundation', parentTopicName: 'Books' },
        ],
        logStructureGroups: [
            { name: 'Education' },
        ],
        logStructures: [
            {
                groupName: 'Education',
                name: 'Reading',
                eventKeys: [
                    { name: 'Book', type: 'log_topic', parentTopicName: 'Books' },
                    { name: 'Progress', type: 'string' },
                ],
                eventTitleTemplate: '$0: $1 ($2)',
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

    const actions = TestUtils.getActions();
    await expect(() => actions.invoke('log-topic-delete', 2)).rejects.toThrow();
    const logEvent = await actions.invoke('log-event-load', { __id__: 1 });
    logEvent.logStructure.eventKeys[0].value = await actions.invoke('log-topic-load', { __id__: 3 });
    await actions.invoke('log-event-upsert', logEvent);
    await actions.invoke('log-topic-delete', 2);
});
