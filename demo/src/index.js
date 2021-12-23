/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { Builder } = require('selenium-webdriver');
const yargs = require('yargs');

const { runLessons } = require('./lessons');
const { ProcessWrapper, StreamIntender } = require('./process');

async function main(argv) {
    console.info('Initializing ...');

    const config = JSON.parse(fs.readFileSync(argv.configPath));
    const dataDir = path.dirname(config.database.storage);
    try {
        fs.accessSync(dataDir);
    } catch (_e) {
        fs.mkdirSync(dataDir);
    }
    console.info(`${argv.indent}Ensured existance of data directory!`);

    const [serverCommand, ...serverArgs] = 'yarn run server -c'.split(' ').concat(argv.configPath);
    const databaseResetProcess = new ProcessWrapper({
        command: serverCommand,
        argv: serverArgs.concat('-a', 'database-reset'),
        stream: new StreamIntender(process.stdout, `${argv.indent + argv.indent}[database-reset] `),
        verbose: argv.verbose,
    });
    await databaseResetProcess.start();
    await databaseResetProcess.waitUntilExit();
    console.info(`${argv.indent}Database reset!`);

    const serverProcess = new ProcessWrapper({
        command: serverCommand,
        argv: serverArgs,
        stream: new StreamIntender(process.stdout, `${argv.indent + argv.indent}[server] `),
        verbose: argv.verbose,
    });
    await serverProcess.start();
    await serverProcess.waitUntilOutput('Server ready!');
    console.info(`${argv.indent}Test server started!`);

    const rect = {
        width: 1920, height: 1080, x: 0, y: 0,
    };
    const webdriver = new Builder().forBrowser('chrome').build();
    await webdriver.manage().window().setRect(rect);
    await webdriver.get(`http://${config.server.host}:${config.server.port}`);
    console.info(`${argv.indent}Webdriver started!`);

    let recordingProcess;
    if (argv.record) {
        recordingProcess = new ProcessWrapper({
            command: 'ffmpeg',
            argv: (
                '-f avfoundation '
                + '-i 1: ' // ffmpeg -f avfoundation -list_devices true -i ""
                + '-pix_fmt yuv420p '
                + `-vf crop=${rect.width}:${rect.height}:${rect.x}:${rect.y} `
                + `-y ${argv.recordingPath}`
            ).split(' '),
            stream: new StreamIntender(process.stdout, `${argv.indent + argv.indent}[screen-recording] `),
            verbose: argv.verbose,
        });
        await recordingProcess.start();
        await recordingProcess.waitUntilOutput(argv.recordingPath);
        console.info(`${argv.indent}Screen recording started!`);
    }

    console.info('Initialized!');

    try {
        await webdriver.executeScript('window.onmousedown = (event) => { if (event.button === 2) debugger; };');
        await runLessons(webdriver, argv);
    } catch (error) {
        console.error(error);
    }

    console.info('Terminating ...');

    if (argv.record) {
        await recordingProcess.stop();
    }
    await webdriver.quit();
    await serverProcess.stop();

    if (argv.record && argv.recordingPath.endsWith('.mkv')) {
        // Directly generating an MP4 file does not work for some reason.
        console.info(`${argv.indent}Converting to mp4 format ...`);
        const formatConversionProcess = new ProcessWrapper({
            command: 'ffmpeg',
            argv: (
                `-i ${argv.recordingPath} `
                + '-codec copy '
                + `-y ${argv.recordingPath.replace('mkv', 'mp4')}`
            ).split(' '),
            stream: new StreamIntender(process.stdout, `${argv.indent + argv.indent}[format-conversion] `),
            verbose: argv.verbose,
        });
        await formatConversionProcess.start();
        await formatConversionProcess.waitUntilExit();
    }

    console.info('Terminated!');
}

const { argv } = yargs
    // General
    .option('configPath', { alias: 'c', default: './demo/config.json' })
    .demandOption('configPath')
    .option('verbose')
    .option('indent', { default: '\t' })
    // Screen Recording
    .option('record')
    .option('recordingPath', { default: './demo/data/demo.mkv' })
    // Lessons
    .option('filter')
    .option('wait', { default: 0 });

main(argv).catch((error) => console.error(error));
