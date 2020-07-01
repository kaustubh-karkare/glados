/* eslint-disable func-names */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import assert from '../../common/assert';
import { awaitSequence, getCallbackAndPromise } from '../Utils';
import ActionsRegistry from './Registry';

const location = 'database';

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

function getFileName({ date, time, hash }) {
    return `backup-${date}-${time}-${hash}.json`;
}

function parseFileName(filename) {
    const matchResult = filename.match(/^backup-(\d+)-(\d+)-(\w+)\.json$/);
    return { date: matchResult[1], time: matchResult[2], hash: matchResult[3] };
}

ActionsRegistry['backup-save'] = async function () {
    const { date, time } = getDateAndTime();
    const result = {};
    await awaitSequence(this.database.getModelSequence(), async (model) => {
        const items = await model.findAll({ transaction: this.transaction });
        result[model.name] = items.map((item) => item.dataValues);
    });
    const data = JSON.stringify(result, null, 4);
    const hash = crypto.createHash('md5').update(data).digest('hex');

    try {
        const latestBackup = await this.invoke.call(this, 'backup-latest');
        if (hash === latestBackup.hash) {
            return { ...latestBackup, isUnchanged: true };
        }
    } catch (error) {
        assert(error.message === 'no backups found');
    }

    const [callback, promise] = getCallbackAndPromise();
    const filename = getFileName({ date, time, hash });
    fs.writeFile(path.join(location, filename), data, callback);
    await promise;
    return {
        filename, date, time, hash,
    };
};

ActionsRegistry['backup-latest'] = async function () {
    const [callback, promise] = getCallbackAndPromise();
    fs.readdir(location, callback);
    let filenames = await promise;
    filenames = filenames.filter((filename) => filename.startsWith('backup-')).sort();
    assert(filenames.length, 'no backups found');
    const filename = filenames[filenames.length - 1];
    const components = parseFileName(filename);
    return { filename, ...components };
};

ActionsRegistry['backup-load'] = async function () {
    const latestBackup = await this.invoke.call(this, 'backup-latest');

    const [callback, promise] = getCallbackAndPromise();
    fs.readFile(path.join(location, latestBackup.filename), callback);
    const filedata = await promise;
    const data = JSON.parse(filedata);

    // This is where we can transform the input data to fix compatibility!
    await awaitSequence(this.database.getModelSequence(), async (model) => {
        const items = data[model.name];
        await model.bulkCreate(items, { transaction: this.transaction });
    });
    return latestBackup;
};
