import Utils from './Utils';

beforeAll(Utils.beforeAll);
afterAll(Utils.afterAll);

test('test_key_constraint', async () => {
    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-key-delete', 3)).rejects.toThrow();
    await actions.invoke('log-category-delete', 2);
    await actions.invoke('log-key-delete', 3);
});

test('test_entry_constraint', async () => {
    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-category-delete', 1)).rejects.toThrow();
    await actions.invoke('log-entry-delete', 1);
    await actions.invoke('log-entry-delete', 2);
    await actions.invoke('log-category-delete', 1);
});
