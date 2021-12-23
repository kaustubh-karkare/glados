/* eslint-disable no-console */

const fs = require('fs');

const { Application } = require('../components');
const { awaitSequence } = require('../utils');

async function runLessons(webdriver, filter) {
    const originalUrl = await webdriver.getCurrentUrl();
    const app = new Application(webdriver);
    const lessonNames = fs.readdirSync(__dirname)
        .filter((name) => name !== 'index.js')
        .filter((name) => !filter || name.includes(filter))
        .map((name) => name.replace(/.js$/, ''));
    await awaitSequence(lessonNames, async (name, index) => {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const lessonMethod = require(`./${name}`);
        console.info('Lesson:', name);
        try {
            await app.clearDatabase();
            await webdriver.get(originalUrl);
            await lessonMethod(app);
        } catch (error) {
            console.error(error);
            await app.wait(3600 * 1000); // Use this time to debug.
            throw error;
        }
    });
    console.info('Lessons complete!');
}

module.exports = { runLessons };
