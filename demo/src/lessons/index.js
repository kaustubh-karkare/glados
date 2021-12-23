/* eslint-disable no-console */

const fs = require('fs');

const { Application } = require('../components');
const { awaitSequence } = require('../utils');

async function runLessons(webdriver, argv) {
    const resetUrl = await webdriver.getCurrentUrl();
    const app = new Application(webdriver);
    const lessonNames = fs.readdirSync(__dirname)
        .filter((name) => name !== 'index.js')
        .map((name) => name.replace(/.js$/, ''))
        .filter((name) => !argv.filter || name.includes(argv.filter));

    await awaitSequence(lessonNames, async (name, index) => {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const lessonMethod = require(`./${name}`);
        console.info(`${argv.indent}Lesson: ${name}`);
        try {
            await app.clearDatabase();
            await webdriver.get(resetUrl);
            await lessonMethod(app);
        } catch (error) {
            console.error(error);
            await app.wait(argv.wait * 1000); // Use this time to debug.
            throw error;
        }
    });
    await app.wait(argv.wait * 1000); // Use this time to debug.
}

module.exports = { runLessons };
