import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_typeahead', async () => {
    await Utils.bootstrap({
        logCategories: [
            {
                name: 'Animals',
                logKeys: [
                    { name: 'Size', type: 'string' },
                    { name: 'Legs', type: 'integer' },
                ],
            },
        ],
        logEntries: [
            {
                title: 'Cat',
                category: 'Animals',
                logValues: ['small', '4'],
            },
        ],
    });

    const actions = Utils.getActions();
    let logValues;

    const item = { logKey: { id: 1 } };
    logValues = await actions.invoke('log-value-typeahead', { item });
    expect(logValues.length).toEqual(1);

    item.logKey.id = 3;
    logValues = await actions.invoke('log-value-typeahead', { item });
    expect(logValues.length).toEqual(0);
});
