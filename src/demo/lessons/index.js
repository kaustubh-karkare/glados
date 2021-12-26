/* eslint-disable no-console */

import Application from '../components';
import { asyncSequence } from '../utils';

const lessonsList = require.context('.');

export default async (webdriver, argv) => {
    if (!argv.filter) {
        console.info(`${argv.indent}Note: Running all lessons! (hint: --filter)`);
    }

    const resetUrl = await webdriver.getCurrentUrl();
    const app = new Application(webdriver);
    const lessonNames = lessonsList.keys()
        .filter((name) => !name.endsWith('.js'))
        .map((name) => name.replace(/^\.\//, ''))
        .filter((name) => name && name !== 'index')
        .filter((name) => !argv.filter || name.includes(argv.filter));

    await asyncSequence(lessonNames, async (name, index) => {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const { default: lessonMethod } = require(`./${name}`);
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
};
