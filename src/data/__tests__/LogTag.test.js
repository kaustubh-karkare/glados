import Utils from './Utils';

beforeAll(Utils.beforeAll);
afterAll(Utils.afterAll);

test('test_typeahead', async () => {
    const actions = Utils.getActions();
    let logTags;

    logTags = await actions.invoke('log-tag-typeahead', { trigger: '@', query: '' });
    expect(logTags.length).toEqual(3);
    logTags = await actions.invoke('log-tag-typeahead', { trigger: '@', query: 'k' });
    expect(logTags.length).toEqual(1);
    logTags = await actions.invoke('log-tag-typeahead', { trigger: '#', query: 'p' });
    expect(logTags.length).toEqual(2);
    logTags = await actions.invoke('log-tag-typeahead', { trigger: '#', query: 'i' });
    expect(logTags.length).toEqual(0);
});
