import Utils from './Utils';

beforeAll(Utils.beforeAll);
afterAll(Utils.afterAll);

test('test_typeahead', async () => {
    const actions = Utils.getActions();
    let logValues;

    const item = { logKey: { id: 1 } };
    logValues = await actions.invoke('log-value-typeahead', { item });
    expect(logValues.length).toEqual(2);

    item.logKey.id = 4;
    logValues = await actions.invoke('log-value-typeahead', { item });
    expect(logValues.length).toEqual(0);
});
