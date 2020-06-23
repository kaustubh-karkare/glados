import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_key_constraint', async () => {
    await Utils.bootstrap({
        logCategories: [
            {
                name: 'Name',
                logKeys: [
                    { name: 'Key', type: 'string' },
                ],
            },
        ],
    });

    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-key-delete', 1)).rejects.toThrow();
    await actions.invoke('log-category-delete', 1);
    await actions.invoke('log-key-delete', 1);
});

test('test_entry_constraint', async () => {
    await Utils.bootstrap({
        logCategories: [
            {
                name: 'Animals',
                logKeys: [
                    { name: 'Size', type: 'string' },
                    { name: 'Legs', type: 'integer' },
                ],
            },
        ],
        logEntries: [
            {
                title: 'Cat',
                category: 'Animals',
                logValues: ['small', '4'],
            },
        ],
    });

    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-category-delete', 1)).rejects.toThrow();
    await actions.invoke('log-entry-delete', 1);
    await actions.invoke('log-category-delete', 1);
});
