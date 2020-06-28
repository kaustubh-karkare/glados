import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_key_constraint', async () => {
    await Utils.loadData({
        logStructures: [
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
    await actions.invoke('log-structure-delete', 1);
    const logKeys = await actions.invoke('log-key-list');
    expect(logKeys.length).toEqual(0);
});

test('test_entry_constraint', async () => {
    await Utils.loadData({
        logStructures: [
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
                date: '2020-06-28',
                title: 'Cat',
                structure: 'Animals',
                logValues: ['small', '4'],
            },
        ],
    });

    const actions = Utils.getActions();
    await expect(() => actions.invoke('log-structure-delete', 1)).rejects.toThrow();
    await actions.invoke('log-entry-delete', 1);
    await actions.invoke('log-structure-delete', 1);
    const logKeys = await actions.invoke('log-key-list');
    expect(logKeys.length).toEqual(0);
});

test('test_title_template', async () => {
    await Utils.loadData({
        logStructures: [
            {
                name: 'Cycling',
                logKeys: [
                    { name: 'Distance (miles)', type: 'integer' },
                    { name: 'Time (minutes)', type: 'integer' },
                ],
                titleTemplate: 'Cycling: $1 miles / $2 minutes ({($1*60/$2).toFixed(2)} mph)',
            },
        ],
        logEntries: [
            {
                date: '2020-06-26',
                structure: 'Cycling',
                logValues: ['15', '60'],
            },
            {
                date: '2020-06-27',
                structure: 'Cycling',
                logValues: ['15', '55'],
            },
            {
                date: '2020-06-28',
                structure: 'Cycling',
                logValues: ['15', '50'],
            },
        ],
    });

    const actions = Utils.getActions();
    const logEntries = await actions.invoke('log-entry-list');
    expect(logEntries[0].name).toEqual('Cycling: 15 miles / 60 minutes (15.00 mph)');
    expect(logEntries[1].name).toEqual('Cycling: 15 miles / 55 minutes (16.36 mph)');
    expect(logEntries[2].name).toEqual('Cycling: 15 miles / 50 minutes (18.00 mph)');
});
