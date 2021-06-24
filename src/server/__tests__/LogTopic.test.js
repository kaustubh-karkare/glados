import TextEditorUtils from '../../common/TextEditorUtils';
import Utils from './Utils';
import { awaitSequence } from '../../data';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_log_topic_typeahead', async () => {
    await Utils.loadData({
        logModes: [
            { name: 'Test' },
        ],
        logTopics: [
            { modeName: 'Test', name: 'Anurag Dubey' },
            { modeName: 'Test', name: 'Kaustubh Karkare' },
            { modeName: 'Test', name: 'Vishnu Mohandas' },
            { modeName: 'Test', name: 'philosophy' },
            { modeName: 'Test', name: 'productivity' },
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
        logModes: [
            { name: 'Test' },
        ],
        logTopics: [
            { modeName: 'Test', name: 'Hacky' },
            { modeName: 'Test', name: 'Todo', details: 'Speak to a #1' },
        ],
        logEvents: [
            { modeName: 'Test', date: '{today}', title: 'Spoke to a #1' },
        ],
    });

    const actions = Utils.getActions();
    let logEvent = await actions.invoke('log-event-load', { id: 1 });
    expect(TextEditorUtils.extractPlainText(logEvent.title)).toEqual('Spoke to a Hacky');
    let logTopic = await actions.invoke('log-topic-load', { id: 2 });
    expect(TextEditorUtils.extractPlainText(logTopic.details)).toEqual('Speak to a Hacky');

    const person = await actions.invoke('log-topic-load', { id: 1 });
    person.name = 'Noob';
    await actions.invoke('log-topic-upsert', person);

    logEvent = await actions.invoke('log-event-load', logEvent);
    expect(TextEditorUtils.extractPlainText(logEvent.title)).toEqual('Spoke to a Noob');
    logTopic = await actions.invoke('log-topic-load', logTopic);
    expect(TextEditorUtils.extractPlainText(logTopic.details)).toEqual('Speak to a Noob');

    await expect(() => actions.invoke('log-topic-delete', person.id)).rejects.toThrow();
    await actions.invoke('log-event-delete', logEvent.id);
    await actions.invoke('log-topic-delete', logTopic.id);
    await actions.invoke('log-topic-delete', person.id);
});

test('test_counts', async () => {
    await Utils.loadData({
        logModes: [
            { name: 'Test' },
        ],
        logTopics: [
            { modeName: 'Test', name: 'Parent1' },
            { modeName: 'Test', name: 'Parent2' },
            { modeName: 'Test', name: 'Child', parentTopicName: 'Parent1' },
        ],
    });

    const actions = Utils.getActions();

    const parentLogTopicIds = [1, 2];
    const expectChildCounts = async (counts) => {
        await awaitSequence(
            parentLogTopicIds,
            async (id, index) => {
                const parentLogTopic = await actions.invoke('log-topic-load', { id });
                expect(parentLogTopic.childCount).toEqual(counts[index]);
            },
        );
    };
    await expectChildCounts([1, 0]);

    let childLogTopic = await actions.invoke('log-topic-load', { id: 3 });
    expect(childLogTopic.parentLogTopic.id).toEqual(1);
    childLogTopic.parentLogTopic.id = 2;
    childLogTopic = await actions.invoke('log-topic-upsert', childLogTopic);
    expect(childLogTopic.parentLogTopic.id).toEqual(2);
    await expectChildCounts([0, 1]);

    await actions.invoke('log-topic-delete', childLogTopic.id);
    await expectChildCounts([0, 0]);
});
