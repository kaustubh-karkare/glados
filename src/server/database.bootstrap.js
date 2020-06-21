import { createCategoryTemplate } from '../data/LogCategory';

const data = {
    categories: [
        {
            name: 'Cycling',
            logKeys: [
                { name: 'Distance (miles)', type: 'integer' },
                { name: 'Time (minutes)', type: 'integer' },
                { name: 'Calories', type: 'integer' },
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
    logTags: [
        {
            type: 'person',
            name: 'Anurag Dubey',
        },
        {
            type: 'person',
            name: 'Kaustubh Karkare',
        },
        {
            type: 'person',
            name: 'Vishnu Mohandas',
        },
    ],
};

function awaitSequence(items, method) {
    return new Promise((resolve, reject) => {
        let index = 0;
        const results = [];
        const next = () => {
            if (index === items.length) {
                resolve(results);
            } else {
                method(items[index], index, items)
                    .then((result) => {
                        results.push(result);
                        index += 1;
                        next();
                    })
                    .catch((error) => reject(error));
            }
        };
        next();
    });
}

async function bootstrap(actions, database) {
    await awaitSequence(data.categories, async (category, categoryIndex) => {
        category.id = -categoryIndex - 1;
        category.logKeys = category.logKeys.map(
            (logKey, logKeyIndex) => ({ ...logKey, id: -logKeyIndex - 1 }),
        );
        category.template = createCategoryTemplate(category.template, category.logKeys);
        return actions['log-category-upsert'].call({ database }, category);
    });
    await awaitSequence(data.logTags, async (logTag, logTagIndex) => {
        logTag.id = -logTagIndex - 1;
        return actions['log-tag-upsert'].call({ database }, logTag);
    });
}

export default bootstrap;
