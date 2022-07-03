import { asyncSequence } from '../../../common/AsyncUtils';
import { LogKey } from '../../../common/data_types';
import RichTextUtils from '../../../common/RichTextUtils';
import TestUtils from './TestUtils';

beforeEach(TestUtils.beforeEach);
afterEach(TestUtils.afterEach);

test('test_log_topic_typeahead', async () => {
    await TestUtils.loadData({
        logTopics: [
            { name: 'Anurag Dubey' },
            { name: 'Kaustubh Karkare' },
            { name: 'Vishnu Mohandas' },
            { name: 'philosophy' },
            { name: 'productivity' },
        ],
    });

    const actions = TestUtils.getActions();
    let logTopics;

    logTopics = await actions.invoke('log-topic-typeahead', { query: '' });
    expect(logTopics.length).toEqual(5);
    logTopics = await actions.invoke('log-topic-typeahead', { query: 'k' });
    expect(logTopics.length).toEqual(1);
    logTopics = await actions.invoke('log-topic-typeahead', { query: 'p' });
    expect(logTopics.length).toEqual(2);
    logTopics = await actions.invoke('log-topic-typeahead', { query: 'i' });
    expect(logTopics.length).toEqual(3); // appears in 3 different items
    logTopics = await actions.invoke('log-topic-typeahead', { query: 'x' });
    expect(logTopics.length).toEqual(0);
});

test('test_update_propagation', async () => {
    await TestUtils.loadData({
        logTopics: [
            { name: 'Hacky' },
            { name: 'Todo', details: 'Speak to a #1' },
        ],
        logEvents: [
            { date: '{today}', title: 'Spoke to a #1' },
        ],
    });

    const actions = TestUtils.getActions();
    let logEvent = await actions.invoke('log-event-load', { __id__: 1 });
    expect(RichTextUtils.extractPlainText(logEvent.title)).toEqual('Spoke to a Hacky');
    let logTopic = await actions.invoke('log-topic-load', { __id__: 2 });
    expect(RichTextUtils.extractPlainText(logTopic.details)).toEqual('Speak to a Hacky');

    const person = await actions.invoke('log-topic-load', { __id__: 1 });
    person.name = 'Noob';
    await actions.invoke('log-topic-upsert', person);

    logEvent = await actions.invoke('log-event-load', logEvent);
    expect(RichTextUtils.extractPlainText(logEvent.title)).toEqual('Spoke to a Noob');
    logTopic = await actions.invoke('log-topic-load', logTopic);
    expect(RichTextUtils.extractPlainText(logTopic.details)).toEqual('Speak to a Noob');

    await expect(() => actions.invoke('log-topic-delete', person.__id__)).rejects.toThrow();
    await actions.invoke('log-event-delete', logEvent.__id__);
    await actions.invoke('log-topic-delete', logTopic.__id__);
    await actions.invoke('log-topic-delete', person.__id__);
});

test('test_child_keys', async () => {
    await TestUtils.loadData({
        logTopics: [
            { name: 'Movies' },
            { name: 'The Martian', parentTopicName: 'Movies' },
            { name: 'Inside Out', parentTopicName: 'Movies' },
            { name: 'Bhool Bhulaiyaa 2', parentTopicName: 'Movies' },
        ],
    });

    const actions = TestUtils.getActions();
    let parentLogTopic = await actions.invoke('log-topic-load', { __id__: 1 });
    const newLogKey = {
        ...LogKey.createVirtual(),
        name: 'Worthwhile?',
        type: LogKey.Type.YES_OR_NO,
        // value: 'yes',
    };
    parentLogTopic.childKeys = [newLogKey];
    await expect(() => actions.invoke('log-topic-upsert', parentLogTopic)).rejects.toThrow();
    parentLogTopic.childKeys[0].value = 'yes';
    parentLogTopic = await actions.invoke('log-topic-upsert', parentLogTopic);

    let childLogTopic = await actions.invoke('log-topic-load', { __id__: 4 });
    childLogTopic.parentLogTopic.childKeys[0].value = 'no';
    childLogTopic = await actions.invoke('log-topic-upsert', childLogTopic);
});

test('test_counts', async () => {
    await TestUtils.loadData({
        logTopics: [
            { name: 'Parent1' },
            { name: 'Parent2' },
            { name: 'Child', parentTopicName: 'Parent1' },
        ],
    });

    const actions = TestUtils.getActions();

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
