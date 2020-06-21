import Utils from './Utils';

beforeAll(Utils.beforeAll);
afterAll(Utils.afterAll);

test('test_typeahead', async () => {
    const actions = Utils.getActions();
    let logValues;

    logValues = await actions.invoke('log-value-typeahead', { logKey: { id: 1 } });
    expect(logValues.length).toEqual(2);
    logValues = await actions.invoke('log-value-typeahead', { logKey: { id: 4 } });
    expect(logValues.length).toEqual(0);
});
