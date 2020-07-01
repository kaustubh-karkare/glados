import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_typeahead', async () => {
    await Utils.loadData({
        logTopicGroups: [
            { name: 'People' },
            { name: 'General' },
        ],
        logTopics: [
            { group: 'People', name: 'Anurag Dubey' },
            { group: 'People', name: 'Kaustubh Karkare' },
            { group: 'People', name: 'Vishnu Mohandas' },
            { group: 'General', name: 'philosophy' },
            { group: 'General', name: 'productivity' },
        ],
    });

    const actions = Utils.getActions();
    let logTopics;

    logTopics = await actions.invoke('log-topic-typeahead', { query: '' });
    expect(logTopics.length).toEqual(5);
    logTopics = await actions.invoke('log-topic-typeahead', { query: 'k' });
    expect(logTopics.length).toEqual(1);
    logTopics = await actions.invoke('log-topic-typeahead', { query: 'p' });
    expect(logTopics.length).toEqual(2);
    logTopics = await actions.invoke('log-topic-typeahead', { query: 'i' });
    expect(logTopics.length).toEqual(0);
});

test('test_update_propagation', async () => {
    await Utils.loadData({
        logTopicGroups: [
            { name: 'People' },
        ],
        logTopics: [
            { group: 'People', name: 'Hacky' },
        ],
        logEntries: [
            { date: '{today}', title: 'Spoke to a #1' },
        ],
    });

    const actions = Utils.getActions();
    let logEntry = await actions.invoke('log-entry-load', { id: 1 });
    expect(logEntry.name).toEqual('Spoke to a Hacky');

    const logTopic = await actions.invoke('log-topic-load', { id: 1 });
    logTopic.name = 'Noob';
    await actions.invoke('log-topic-upsert', logTopic);

    logEntry = await actions.invoke('log-entry-load', logEntry);
    expect(logEntry.name).toEqual('Spoke to a Noob');
});
