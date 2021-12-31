/* eslint-disable func-names */

import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { callbackToPromise } from '../../common/AsyncUtils';

function getDateAndTime() {
    const date = new Date();
    let dateLabel = date.getFullYear();
    dateLabel += (`0${(date.getMonth() + 1)}`).substr(-2);
    dateLabel += (`0${date.getDate()}`).substr(-2);
    let timeLabel = (`0${date.getHours()}`).substr(-2);
    timeLabel += (`0${date.getMinutes()}`).substr(-2);
    timeLabel += (`0${date.getSeconds()}`).substr(-2);
    return { date: dateLabel, time: timeLabel };
}

function parseDateAndTime(date, time) {
    return `${date.substr(0, 4)
    }-${date.substr(4, 2)
    }-${date.substr(6, 2)
    } ${time.substr(0, 2)
    }:${time.substr(2, 2)
    }:${time.substr(4, 2)}`;
}

function getFileName({ date, time, hash }) {
    return `backup-${date}-${time}-${hash}.json`;
}

function parseFileName(filename) {
    const matchResult = filename.match(/^backup-(\d+)-(\d+)-(\w+)\.json$/);
    return {
        hash: matchResult[3],
        timetamp: parseDateAndTime(matchResult[1], matchResult[2]),
    };
}

// Intermediate Operations.

const ActionsRegistry = {};

ActionsRegistry['backup-file-load'] = async function ({ filename }) {
    const filedata = await callbackToPromise(
        fs.readFile,
        path.join(this.config.backup.location, filename),
    );
    return JSON.parse(filedata);
};

ActionsRegistry['backup-file-save'] = async function ({ data }) {
    const { date, time } = getDateAndTime();

    const dataSerialized = JSON.stringify(data, null, '\t');
    const hash = crypto.createHash('md5').update(dataSerialized).digest('hex');

    try {
        const latestBackup = await this.invoke.call(this, 'backup-latest');
        if (latestBackup && hash === latestBackup.hash) {
            return { ...latestBackup, isUnchanged: true };
        }
    } catch (error) {
        assert(error.message === 'no backups found');
    }

    const filename = getFileName({ date, time, hash });
    await callbackToPromise(
        fs.writeFile,
        path.join(this.config.backup.location, filename),
        dataSerialized,
    );
    this.broadcast('backup-latest');
    return {
        filename, date, time, hash,
    };
};

ActionsRegistry['backup-transform-data'] = async function (data) {
    // return this.invoke.call(this, 'transformation-method', data);
    return { data };
};

// Actual API

ActionsRegistry['backup-save'] = async function ({ verbose } = {}) {
    const data = await this.invoke.call(this, 'database-load');
    const result = await this.invoke.call(this, 'backup-file-save', { data });
    if (verbose) {
        // eslint-disable-next-line no-console
        console.info(`Saved ${result.filename}${result.isUnchanged ? ' (unchanged)' : ''}`);
    }
    return result;
};

ActionsRegistry['backup-latest'] = async function () {
    let filenames = await callbackToPromise(fs.readdir, this.config.backup.location);
    filenames = filenames.filter((filename) => filename.startsWith('backup-')).sort();
    if (!filenames.length) {
        return null;
    }
    assert(filenames.length, 'no backups found');
    const filename = filenames[filenames.length - 1];
    const components = parseFileName(filename);
    return { filename, ...components };
};

ActionsRegistry['backup-load'] = async function ({ verbose } = {}) {
    const latestBackup = await this.invoke.call(this, 'backup-latest');
    assert(latestBackup, 'at least one backup is required');
    let data = await this.invoke.call(this, 'backup-file-load', { filename: latestBackup.filename });
    const transformationResult = await this.invoke.call(this, 'backup-transform-data', data);
    data = transformationResult.data;
    await this.invoke.call(this, 'database-validate', data);
    await this.invoke.call(this, 'database-save', data);
    if (verbose) {
        // eslint-disable-next-line no-console
        console.info(`Loaded ${latestBackup.filename}`);
    }
    if (transformationResult.validate) {
        await transformationResult.validate();
    }
    return latestBackup;
};

ActionsRegistry['backup-delete'] = async function ({ filename }) {
    return callbackToPromise(fs.unlink, path.join(this.config.backup.location, filename));
};

export default ActionsRegistry;
