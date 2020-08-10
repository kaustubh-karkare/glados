import TextEditorUtils from '../../common/TextEditorUtils';
import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_log_topic_typeahead', async () => {
    await Utils.loadData({
        logTopics: [
            { name: 'Anurag Dubey' },
            { name: 'Kaustubh Karkare' },
            { name: 'Vishnu Mohandas' },
            { name: 'philosophy' },
            { name: 'productivity' },
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
    expect(logTopics.length).toEqual(3);
});

test('test_update_propagation', async () => {
    await Utils.loadData({
        logTopics: [
            { name: 'Hacky' },
            { name: 'Todo', details: 'Speak to a #1' },
        ],
        logEvents: [
            { date: '{today}', title: 'Spoke to a #1' },
        ],
    });

    const actions = Utils.getActions();
    let logEvent = await actions.invoke('log-event-load', { id: 1 });
    expect(logEvent.name).toEqual('Spoke to a Hacky');
    let logTopic = await actions.invoke('log-topic-load', { id: 2 });
    expect(TextEditorUtils.extractPlainText(logTopic.details)).toEqual('Speak to a Hacky');

    const person = await actions.invoke('log-topic-load', { id: 1 });
    person.name = 'Noob';
    await actions.invoke('log-topic-upsert', person);

    logEvent = await actions.invoke('log-event-load', logEvent);
    expect(logEvent.name).toEqual('Spoke to a Noob');
    logTopic = await actions.invoke('log-topic-load', logTopic);
    expect(TextEditorUtils.extractPlainText(logTopic.details)).toEqual('Speak to a Noob');

    await expect(() => actions.invoke('log-topic-delete', person.id)).rejects.toThrow();
    await actions.invoke('log-event-delete', logEvent.id);
    await actions.invoke('log-topic-delete', logTopic.id);
    await actions.invoke('log-topic-delete', person.id);
});
