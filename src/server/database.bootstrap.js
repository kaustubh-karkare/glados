const bootstrapData = {
    logStructures: [
        {
            name: 'Cycling',
            logKeys: [
                { name: 'Distance (miles)', type: 'integer' },
                { name: 'Time (minutes)', type: 'integer' },
            ],
            template: 'Cycling: $1 miles / $2 minutes ({Math.floor(100*$1*60/$2)/100} mph)',
        },
        {
            name: 'Surya Namaskar',
            logKeys: [
                { name: 'Surya Namaskar Count', type: 'integer' },
            ],
            template: 'Surya Namaskar: $1',
        },
        {
            name: 'Food',
            logKeys: [
                { name: 'Food Name', type: 'string' },
                { name: 'Food Quantity', type: 'string' },
            ],
            template: 'Food: $1 ($2)',
        },
        {
            name: 'Book',
            logKeys: [
                { name: 'Book Name', type: 'string' },
                { name: 'Progress', type: 'string' },
            ],
            template: 'Book: $1 ($2)',
        },
        {
            name: 'Movie',
            logKeys: [
                { name: 'Movie Name', type: 'string' },
            ],
            template: 'Movie: $1',
        },
        {
            name: 'Television',
            logKeys: [
                { name: 'Show Name', type: 'string' },
                { name: 'Progress', type: 'string' },
            ],
            template: 'TV: $1 ($2)',
        },
        {
            name: 'Article',
            logKeys: [
                { name: 'Name', type: 'string' },
                { name: 'Link', type: 'string' },
            ],
            template: 'Article: $1',
        },
    ],
    logEntries: [
        {
            structure: 'Cycling',
            logValues: ['15', '55'],
        },
        {
            structure: 'Cycling',
            logValues: ['15', '60'],
        },
    ],
};

// eslint-disable-next-line import/prefer-default-export
export { bootstrapData };
