const bootstrapData = {
    logStructures: [
        {
            name: 'Cycling',
            logKeys: [
                { name: 'Distance (miles)', type: 'integer' },
                { name: 'Time (minutes)', type: 'integer' },
            ],
            titleTemplate: 'Cycling: $1 miles / $2 minutes ({Math.floor(100*$1*60/$2)/100} mph)',
        },
        {
            name: 'Surya Namaskar',
            logKeys: [
                { name: 'Surya Namaskar Count', type: 'integer' },
            ],
            titleTemplate: 'Surya Namaskar: $1',
        },
        {
            name: 'Food',
            logKeys: [
                { name: 'Food Name', type: 'string' },
                { name: 'Food Quantity', type: 'string' },
            ],
            titleTemplate: 'Food: $1 ($2)',
        },
        {
            name: 'Book',
            logKeys: [
                { name: 'Book Name', type: 'string' },
                { name: 'Progress', type: 'string' },
            ],
            titleTemplate: 'Book: $1 ($2)',
        },
        {
            name: 'Movie',
            logKeys: [
                { name: 'Movie Name', type: 'string' },
            ],
            titleTemplate: 'Movie: $1',
        },
        {
            name: 'Television',
            logKeys: [
                { name: 'Show Name', type: 'string' },
                { name: 'Progress', type: 'string' },
            ],
            titleTemplate: 'TV: $1 ($2)',
        },
        {
            name: 'Article',
            logKeys: [
                { name: 'Name', type: 'string' },
                { name: 'Link', type: 'string' },
            ],
            titleTemplate: 'Article: $1',
        },
    ],
    logEntries: [
        {
            date: '{yesterday}',
            structure: 'Cycling',
            logValues: ['15', '55'],
        },
        {
            date: '{today}',
            structure: 'Cycling',
            logValues: ['15', '60'],
        },
        {
            date: '{today}',
            title: 'Call home!',
            logReminder: {
                type: 'deadline',
                deadline: '2020-08-12',
                warning: '2 days',
            },
        },
    ],
};

// eslint-disable-next-line import/prefer-default-export
export { bootstrapData };
