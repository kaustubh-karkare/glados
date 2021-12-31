import TestUtils from './TestUtils';

beforeEach(TestUtils.beforeEach);
afterEach(TestUtils.afterEach);

test('test_structure_constraint', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'TestGroup' },
        ],
        logStructures: [
            {
                groupName: 'TestGroup',
                name: 'Animals',
                logKeys: [
                    { name: 'Size', type: 'string' },
                    { name: 'Legs', type: 'integer' },
                ],
            },
        ],
        logEvents: [
            {
                date: '2020-06-28',
                title: 'Cat',
                structureName: 'Animals',
                logValues: ['small', '4'],
            },
        ],
    });

    const actions = TestUtils.getActions();
    await expect(() => actions.invoke('log-structure-delete', 1)).rejects.toThrow();
    await actions.invoke('log-event-delete', 1);
    await actions.invoke('log-structure-delete', 1);
});

test('test_event_update', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'TestGroup' },
        ],
        logStructures: [
            {
                groupName: 'TestGroup',
                name: 'Animals',
                logKeys: [
                    { name: 'Size', type: 'string' },
                    { name: 'Legs', type: 'integer' },
                ],
            },
        ],
        logEvents: [
            {
                date: '2020-06-28',
                title: 'Cat',
                structureName: 'Animals',
                logValues: ['small', '4'],
            },
        ],
    });

    const actions = TestUtils.getActions();

    const logEvent = await actions.invoke('log-event-load', { __id__: 1 });
    logEvent.title = 'Dog';
    logEvent.logStructure.logKeys[0].value = 'medium';
    await actions.invoke('log-event-upsert', logEvent);
});

test('test_log_event_value_typeahead', async () => {
    await TestUtils.loadData({
        logStructureGroups: [
            { name: 'TestGroup' },
        ],
        logStructures: [
            {
                groupName: 'TestGroup',
                name: 'Animals',
                logKeys: [
                    { name: 'Size', type: 'string' },
                    { name: 'Legs', type: 'integer' },
                ],
            },
        ],
        logEvents: [
            {
                date: '2020-06-28',
                title: 'Cat',
                structureName: 'Animals',
                logValues: ['small', '4'],
            },
        ],
    });

    const actions = TestUtils.getActions();
    let logValueSuggestions;

    const logEvent = await actions.invoke('log-event-load', { __id__: 1 });
    const input = { logStructure: logEvent.logStructure, index: null, query: '' };

    logValueSuggestions = await actions.invoke('value-typeahead', { ...input, index: 0 });
    expect(logValueSuggestions).toEqual(['small']);

    logValueSuggestions = await actions.invoke('value-typeahead', { ...input, index: 1 });
    expect(logValueSuggestions).toEqual(['4']);
});
