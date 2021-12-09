/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const Actions = require('./actions');
const Server = require('./server');
const Webdriver = require('./webdriver');

// TODO: Take this an CLI input.
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
    await server.start();

    const api = new Webdriver();

    // Set window to bottom left quadrant of screen.
    // TODO: Compute these sizes.
    const monitor = { width: 3840, height: 2160 };
    await api.webdriver.manage().window().setRect({
        width: monitor.width / 2,
        height: monitor.height / 2,
        x: monitor.width * 0,
        y: monitor.height / 2,
    });

    try {
        await api.webdriver.get(`http://${config.server.host}:${config.server.port}`);
        await api.wait(1000); // TODO: Figure out a different signal.
        await Actions(api);
    } catch (error) {
        console.error(error);
    } finally {
        await api.webdriver.quit();
        await server.stop();
    }
}

main().catch((error) => console.error(error));
