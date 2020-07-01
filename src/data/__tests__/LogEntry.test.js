import LogValue from '../LogValue';
import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_entry_update', async () => {
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

    const logEntry = await actions.invoke('log-entry-load', { id: 1 });
    logEntry.title = 'Dog';
    logEntry.logValues = [
        LogValue.createVirtual({ logKey: logEntry.logValues[0].logKey, data: 'medium' }),
        logEntry.logValues[1],
    ];
    await actions.invoke('log-entry-upsert', logEntry);
});
