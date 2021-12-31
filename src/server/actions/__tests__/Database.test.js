import TestUtils from './TestUtils';

beforeEach(TestUtils.beforeEach);
afterEach(TestUtils.afterEach);

test('test_load_save_and_clear', async () => {
    await TestUtils.loadData({
        logTopics: [
            { name: 'Physics', parentTopicName: 'Mathematics' },
            { name: 'Chemistry', parentTopicName: 'Chemistry' },
            { name: 'Mathematics' },
            { name: 'English' },
            { name: 'Computer Science', parentTopicName: 'Physics' },
        ],
    });

    const actions = await TestUtils.getActions();
    const data = await actions.invoke('database-load');
    data.log_topics = data.log_topics.slice(0, -2);
    await actions.invoke('database-save', data);
    const logTopics = await actions.invoke('log-topic-list');
    expect(logTopics.length).toEqual(3);
});

test('test_data_format_version', async () => {
    const actions = await TestUtils.getActions();
    await actions.invoke('database-validate');
    const data = await actions.invoke('database-load');
    await actions.invoke('database-validate', data);
    data.settings[0].value += '+';
    await expect(actions.invoke('database-validate', data)).rejects.toThrow();
});
