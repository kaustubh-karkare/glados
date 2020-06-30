import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_typeahead', async () => {
    await Utils.loadData({
        logTags: [
            { type: 'person', name: 'Anurag Dubey' },
            { type: 'person', name: 'Kaustubh Karkare' },
            { type: 'person', name: 'Vishnu Mohandas' },
            { type: 'hashtag', name: 'philosophy' },
            { type: 'hashtag', name: 'productivity' },
        ],
    });

    const actions = Utils.getActions();
    let logTags;

    logTags = await actions.invoke('log-tag-typeahead', { query: '' });
    expect(logTags.length).toEqual(5);
    logTags = await actions.invoke('log-tag-typeahead', { query: 'k' });
    expect(logTags.length).toEqual(1);
    logTags = await actions.invoke('log-tag-typeahead', { query: 'p' });
    expect(logTags.length).toEqual(2);
    logTags = await actions.invoke('log-tag-typeahead', { query: 'i' });
    expect(logTags.length).toEqual(0);
});
