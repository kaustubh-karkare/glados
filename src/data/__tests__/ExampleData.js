export default {
    logTopicGroups: [
        { name: 'People' },
        { name: 'General' },
    ],
    logTopics: [
        { group: 'People', name: 'Anurag Dubey' },
        { group: 'People', name: 'Kaustubh Karkare' },
        { group: 'People', name: 'Vishnu Mohandas' },
        { group: 'General', name: 'philosophy' },
        { group: 'General', name: 'productivity' },
    ],
    logStructures: [
        {
            name: 'Cycling',
            logKeys: [
                { name: 'Distance (miles)', type: 'regex', typeArgs: '^\\d+$' },
                { name: 'Time (minutes)', type: 'regex', typeArgs: '^\\d+$' },
            ],
            titleTemplate: 'Cycling: $1 miles / $2 minutes ({($1*60/$2).toFixed(2)} mph)',
        },
        {
            name: 'Surya Namaskar',
            logKeys: [
                { name: 'Surya Namaskar Count', type: 'regex', typeArgs: '^\\d+$' },
            ],
            titleTemplate: 'Surya Namaskar: $1',
        },
        {
            name: 'Food',
            logKeys: [
                { name: 'Food Name' },
                { name: 'Food Quantity' },
            ],
            titleTemplate: 'Food: $1 ($2)',
        },
        {
            name: 'Book',
            logKeys: [
                { name: 'Book Name' },
                { name: 'Progress' },
            ],
            titleTemplate: 'Book: $1 ($2)',
        },
        {
            name: 'Movie',
            logKeys: [
                { name: 'Movie Name' },
            ],
            titleTemplate: 'Movie: $1',
        },
        {
            name: 'Television',
            logKeys: [
                { name: 'Show Name' },
                { name: 'Progress' },
            ],
            titleTemplate: 'TV: $1 ($2)',
        },
        {
            name: 'Article',
            logKeys: [
                { name: 'Name' },
                { name: 'Link' },
            ],
            titleTemplate: 'Article: $1',
        },
    ],
    logReminderGroups: [
        {
            name: 'Daily Routine',
            type: 'periodic',
            onSidebar: true,
        },
        {
            name: 'Research',
            type: 'deadline',
        },
        {
            name: 'Entertainment',
            type: 'unspecified',
        },
    ],
    logReminders: [
        {
            title: 'Surya Namaskar',
            group: 'Daily Routine',
            frequency: 'everyday',
            lastUpdate: '2020-06-26',
            structure: 'Surya Namaskar',
            needsEdit: true,
        },
        {
            title: 'Read article about Paxos',
            group: 'Research',
            deadline: '2020-06-30',
            warning: '3 days',
        },
        {
            title: 'Movie some movie!',
            group: 'Entertainment',
        },
    ],
    logEntries: [
        {
            date: '2020-06-22',
            structure: 'Cycling',
            logValues: ['15', '55'],
        },
        {
            date: '2020-06-24',
            structure: 'Cycling',
            logValues: ['15', '60'],
        },
    ],
};
