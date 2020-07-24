import Utils from './Utils';

import TextEditorUtils from '../../common/TextEditorUtils';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_title_template', async () => {
    await Utils.loadData({
        logStructureGroups: [
            {
                name: 'Exercise',
            },
        ],
        logStructures: [
            {
                groupName: 'Exercise',
                name: 'Cycling',
                logKeys: [
                    { name: 'Distance (miles)', type: 'integer' },
                    { name: 'Time (minutes)', type: 'integer' },
                ],
                titleTemplate: '$0: $1 miles / $2 minutes',
            },
        ],
        logEvents: [
            {
                date: '2020-06-26',
                structureName: 'Cycling',
                logValues: ['15', '60'],
            },
            {
                date: '2020-06-27',
                structureName: 'Cycling',
                logValues: ['15', '55'],
            },
            {
                date: '2020-06-28',
                structureName: 'Cycling',
                logValues: ['15', '50'],
            },
        ],
    });

    const actions = Utils.getActions();
    let logEvents = await actions.invoke('log-event-list');
    expect(logEvents[0].name).toEqual('Cycling: 15 miles / 60 minutes');
    expect(logEvents[1].name).toEqual('Cycling: 15 miles / 55 minutes');
    expect(logEvents[2].name).toEqual('Cycling: 15 miles / 50 minutes');

    const { logStructure } = logEvents[0];
    logStructure.titleTemplate = TextEditorUtils.convertPlainTextToDraftContent(
        '$0: $1 miles / $2 minutes ({($1*60/$2).toFixed(2)} mph)',
        { $: [logStructure.logTopic, ...logStructure.logKeys] },
    );
    await actions.invoke('log-structure-upsert', logStructure);

    logEvents = await actions.invoke('log-event-list');
    expect(logEvents[0].name).toEqual('Cycling: 15 miles / 60 minutes (15.00 mph)');
    expect(logEvents[1].name).toEqual('Cycling: 15 miles / 55 minutes (16.36 mph)');
    expect(logEvents[2].name).toEqual('Cycling: 15 miles / 50 minutes (18.00 mph)');
});
