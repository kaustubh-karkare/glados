/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import { Builder } from 'selenium-webdriver';
import yargs from 'yargs';

import runLessons from './lessons';
import { ProcessWrapper, StreamIntender } from './process';

async function main(argv) {
    console.info('Initializing ...');

    if (!argv.verbose) {
        console.info(`${argv.indent}Note: Child process output hidden! (hint: --verbose)`);
    }

    const config = JSON.parse(fs.readFileSync(argv.configPath));
    const dataDir = path.dirname(config.database.storage);
    try {
        fs.accessSync(dataDir);
    } catch (_e) {
        fs.mkdirSync(dataDir);
    }
    console.info(`${argv.indent}Prepared data directory!`);

    const [serverCommand, ...serverArgs] = 'yarn run server -c'.split(' ').concat(argv.configPath);
    const databaseResetProcess = new ProcessWrapper({
        command: serverCommand,
        argv: serverArgs.concat('-a', 'database-reset'),
        stream: new StreamIntender(process.stdout, `${argv.indent + argv.indent}[database-reset] `),
        verbose: argv.verbose,
    });
    await databaseResetProcess.start();
    await databaseResetProcess.waitUntilExit();
    console.info(`${argv.indent}Reset Database!`);

    const serverProcess = new ProcessWrapper({
        command: serverCommand,
        argv: serverArgs,
        stream: new StreamIntender(process.stdout, `${argv.indent + argv.indent}[server] `),
        verbose: argv.verbose,
    });
    await serverProcess.start();
    await serverProcess.waitUntilOutput('Server ready!');
    console.info(`${argv.indent}Test server started!`);

    const webdriver = new Builder().forBrowser('chrome').build();
    await webdriver.manage().window().setRect({
        width: 1920, height: 1080, x: 0, y: 1080,
    });
    await webdriver.get(`http://${config.server.host}:${config.server.port}`);
    console.info(`${argv.indent}Webdriver started!`);

    let recordingProcess;
    if (argv.record) {
        const rect = await webdriver.manage().window().getRect();
        recordingProcess = new ProcessWrapper({
            command: 'ffmpeg',
            argv: (
                '-f avfoundation '
                + '-i 1: ' // ffmpeg -f avfoundation -list_devices true -i ""
                + '-pix_fmt yuv420p '
                + `-vf crop=${rect.width}:${rect.height}:${rect.x}:${rect.y} `
                + `-y ${argv.videoPath}`
            ).split(' '),
            stream: new StreamIntender(process.stdout, `${argv.indent + argv.indent}[screen-recording] `),
            verbose: argv.verbose,
        });
        await recordingProcess.start();
        await recordingProcess.waitUntilOutput(argv.videoPath);
        console.info(`${argv.indent}Screen recording started!`);
    } else {
        console.info(`${argv.indent}Skipped screen recording! (hint: --record)`);
    }

    console.info('Initialized!');

    try {
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

    if (argv.record && argv.videoPath.endsWith('.mkv')) {
        // Directly generating an MP4 file does not work for some reason.
        console.info(`${argv.indent}Converting to mp4 format ...`);
        const formatConversionProcess = new ProcessWrapper({
            command: 'ffmpeg',
            argv: (
                `-i ${argv.videoPath} `
                + '-codec copy '
                + `-y ${argv.videoPath.replace('mkv', 'mp4')}`
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
    .option('config-path', { alias: 'c', default: './config/demo.glados.json' })
    .demandOption('config-path')
    .option('verbose')
    .option('indent', { default: '\t' })
    // Recording
    .option('record')
    .option('videoPath', { default: './data/demo.mkv' })
    // Lessons
    .option('filter')
    .option('wait', { default: 0 });

main(argv).catch((error) => console.error(error));
