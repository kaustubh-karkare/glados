/* eslint-disable no-console */

const fs = require('fs');
const util = require('util');

const { Application } = require('../components');
const { awaitSequence } = require('../utils');

const fsReadDir = util.promisify(fs.readdir);

async function runLessons(webdriver) {
    const app = new Application(webdriver);
    let lessonNames = await fsReadDir(__dirname);
    // TODO: Remove!
    lessonNames = ['001-events'];
    // lessonNames = ['002-topics'];
    await awaitSequence(lessonNames, async (lessonName) => {
        const name = lessonName.replace(/.js$/, '');
        if (name === 'index') {
            return;
        }
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const lessonMethod = require(`./${name}`);
        console.info('Lesson:', name);
        try {
            await lessonMethod(app);
        } catch (error) {
            console.error(error);
            await app.wait(3600 * 1000); // TODO: Remove!
            throw error;
        }
    });
    console.info('Lessons complete!');
}

module.exports = { runLessons };
