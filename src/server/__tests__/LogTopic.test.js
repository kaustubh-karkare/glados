import TextEditorUtils from '../../common/TextEditorUtils';
import Utils from './Utils';
import { asyncSequence } from '../../data';

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
    expect(logTopics.length).toEqual(0);
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
    let logEvent = await actions.invoke('log-event-load', { __id__: 1 });
    expect(TextEditorUtils.extractPlainText(logEvent.title)).toEqual('Spoke to a Hacky');
    let logTopic = await actions.invoke('log-topic-load', { __id__: 2 });
    expect(TextEditorUtils.extractPlainText(logTopic.details)).toEqual('Speak to a Hacky');

    const person = await actions.invoke('log-topic-load', { __id__: 1 });
    person.name = 'Noob';
    await actions.invoke('log-topic-upsert', person);

    logEvent = await actions.invoke('log-event-load', logEvent);
    expect(TextEditorUtils.extractPlainText(logEvent.title)).toEqual('Spoke to a Noob');
    logTopic = await actions.invoke('log-topic-load', logTopic);
    expect(TextEditorUtils.extractPlainText(logTopic.details)).toEqual('Speak to a Noob');

    await expect(() => actions.invoke('log-topic-delete', person.__id__)).rejects.toThrow();
    await actions.invoke('log-event-delete', logEvent.__id__);
    await actions.invoke('log-topic-delete', logTopic.__id__);
    await actions.invoke('log-topic-delete', person.__id__);
});

test('test_counts', async () => {
    await Utils.loadData({
        logTopics: [
            { name: 'Parent1' },
            { name: 'Parent2' },
            { name: 'Child', parentTopicName: 'Parent1' },
        ],
    });

    const actions = Utils.getActions();

    const parentLogTopicIds = [1, 2];
    const expectChildCounts = async (counts) => {
        await asyncSequence(
            parentLogTopicIds,
            async (id, index) => {
                const parentLogTopic = await actions.invoke('log-topic-load', { __id__: id });
                expect(parentLogTopic.childCount).toEqual(counts[index]);
            },
        );
    };
    await expectChildCounts([1, 0]);

    let childLogTopic = await actions.invoke('log-topic-load', { __id__: 3 });
    expect(childLogTopic.parentLogTopic.__id__).toEqual(1);
    childLogTopic.parentLogTopic.__id__ = 2;
    childLogTopic = await actions.invoke('log-topic-upsert', childLogTopic);
    expect(childLogTopic.parentLogTopic.__id__).toEqual(2);
    await expectChildCounts([0, 1]);

    await actions.invoke('log-topic-delete', childLogTopic.__id__);
    await expectChildCounts([0, 0]);
});
