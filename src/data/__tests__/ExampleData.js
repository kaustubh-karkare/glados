export default {
    logStructureGroups: [
        { name: 'Daily Routine' },
        { name: 'Entertainment' },
    ],
    logStructures: [
        {
            groupName: 'Entertainment',
            name: 'Movie',
            logKeys: [
                { name: 'Movie Name', type: 'string' },
            ],
            titleTemplate: '$0: $1',
        },
        {
            groupName: 'Daily Routine',
            name: 'Cycling',
            logKeys: [
                { name: 'Distance (miles)', type: 'integer' },
                { name: 'Time (minutes)', type: 'integer' },
            ],
            titleTemplate: '$0: $1 miles / $2 minutes ({($1*60/$2).toFixed(2)} mph)',
        },
        {
            groupName: 'Daily Routine',
            name: 'Surya Namaskar',
            logKeys: [
                { name: 'Surya Namaskar Count', type: 'integer' },
            ],
            titleTemplate: '$0: $1',
            isPeriodic: true,
            frequency: 'everyday',
            lastUpdate: '2020-06-26',
        },
    ],
    logTopics: [
        { name: 'Anurag Dubey' },
        { name: 'Kaustubh Karkare' },
        { name: 'Vishnu Mohandas' },
        { name: 'Research' },
    ],
    logEvents: [
        {
            date: '2020-06-22',
            structureName: 'Cycling',
            logValues: ['15', '55'],
        },
        {
            date: '2020-06-24',
            structureName: 'Cycling',
            logValues: ['15', '60'],
        },
        {
            date: null,
            structureName: 'Movie',
            logValues: ['Limitless'],
            isComplete: false,
        },
        {
            date: '2020-06-30',
            title: '#7: Read article about Paxos',
            isComplete: false,
        },
    ],
};
