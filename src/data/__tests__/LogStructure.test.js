import Utils from './Utils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

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
        logEvents: [
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
    const logEvents = await actions.invoke('log-event-list');
    expect(logEvents[0].name).toEqual('Cycling: 15 miles / 60 minutes (15.00 mph)');
    expect(logEvents[1].name).toEqual('Cycling: 15 miles / 55 minutes (16.36 mph)');
    expect(logEvents[2].name).toEqual('Cycling: 15 miles / 50 minutes (18.00 mph)');
});
