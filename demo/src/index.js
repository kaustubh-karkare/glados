/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { Builder } = require('selenium-webdriver');
const yargs = require('yargs');

const { runLessons } = require('./lessons');
const Server = require('./server');

async function main(argv) {
    const config = JSON.parse(fs.readFileSync(argv.configPath));
    const dataDir = path.dirname(config.database.storage);
    // TODO: rm -rf the data directory.
    try {
        fs.accessSync(dataDir);
    } catch (_e) {
        fs.mkdirSync(dataDir);
    }

    const server = new Server(argv.configPath);
    const webdriver = new Builder().forBrowser('chrome').build();

    // Set window to bottom left quadrant of screen.
    // TODO: Compute these sizes.
    const monitor = { width: 3840, height: 2160 };
    await webdriver.manage().window().setRect({
        width: monitor.width / 2,
        height: monitor.height / 2,
        x: monitor.width * 0,
        y: monitor.height / 2,
    });

    try {
        await server.start();
        await webdriver.get(`http://${config.server.host}:${config.server.port}`);
        await runLessons(webdriver, argv.filter);
    } catch (error) {
        console.error(error);
    } finally {
        await webdriver.quit();
        await server.stop();
    }
}

const { argv } = yargs
    .option('configPath', { alias: 'c', default: './demo/config.json' })
    .demandOption('configPath')
    .option('filter', { alias: 'f' });

main(argv).catch((error) => console.error(error));
