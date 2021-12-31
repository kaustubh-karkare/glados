/* eslint-disable no-console */

import Application from './components';
import { asyncSequence } from '../common/AsyncUtils';

const lessonsContext = require.context('./lessons', false, /\.js$/);

export default async (webdriver, argv) => {
    if (!argv.filter) {
        console.info(`${argv.indent}Note: Running all lessons! (hint: --filter)`);
    }

    const resetUrl = await webdriver.getCurrentUrl();
    const app = new Application(webdriver);
    const lessonNames = lessonsContext.keys()
        .filter((name) => {
            if (!argv.filter) {
                return true;
            }
            // Remove the "./" prefix and ".js" suffix.
            return name.slice(2, -3).includes(argv.filter);
        });

    await asyncSequence(lessonNames, async (name) => {
        const { default: lessonMethod } = lessonsContext(name);
        console.info(`${argv.indent}Lesson: ${name}`);
        try {
            await app.clearDatabase();
            await webdriver.get(resetUrl);
            await lessonMethod(app);
            await app.wait(1000); // 1 sec
        } catch (error) {
            console.error(error);
            await app.wait(argv.wait * 1000); // Use this time to debug.
            throw error;
        }
    });
    await app.wait(argv.wait * 1000); // Use this time to debug.
};
