import Utils from './Utils';

beforeAll(Utils.beforeAll);
afterAll(Utils.afterAll);

test('test_key_constraint', async () => {
    const actions = Utils.getActions();
    await expect(() => actions.database.delete('LogKey', { id: 4 })).rejects.toThrow();
    await actions.invoke('log-category-delete', { id: 2 });
    await actions.database.delete('LogKey', { id: 4 });
});

test('test_entry_constraint', async () => {
    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-category-delete', { id: 1 })).rejects.toThrow();
    await actions.invoke('log-entry-delete', { id: 1 });
    await actions.invoke('log-entry-delete', { id: 2 });
    await actions.invoke('log-category-delete', { id: 1 });
});
