/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { Builder } = require('selenium-webdriver');

const { runLessons } = require('./lessons');
const Server = require('./server');

// TODO: Take this an CLI input?
const CONFIG_PATH = './demo/config.json';

async function main() {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
    const dataDir = path.dirname(config.database.storage);
    // TODO: rm -rf the data directory.
    try {
        fs.accessSync(dataDir);
    } catch (_e) {
        fs.mkdirSync(dataDir);
    }

    const server = new Server(CONFIG_PATH);
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
        await runLessons(webdriver);
    } catch (error) {
        console.error(error);
    } finally {
        await webdriver.quit();
        await server.stop();
    }
}

main().catch((error) => console.error(error));
