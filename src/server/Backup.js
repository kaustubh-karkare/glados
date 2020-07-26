/* eslint-disable func-names */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import assert from '../common/assert';
// import TextEditorUtils from '../common/TextEditorUtils';
import { awaitSequence, getCallbackAndPromise } from '../data';
import ActionsRegistry from './ActionsRegistry';

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

ActionsRegistry['backup-save'] = async function () {
    const { date, time } = getDateAndTime();
    const result = {};
    await awaitSequence(this.database.getModelSequence(), async (model) => {
        const items = await model.findAll({ transaction: this.transaction });
        result[model.name] = items.map((item) => item.dataValues);
    });

    /*
    if (false) {
        // Switch to using markdown instead of draftjs content, which takes less space.
        const convert = (value) => {
            return TextEditorUtils.serialize(
                TextEditorUtils.deserialize(
                    value,
                    TextEditorUtils.StorageType.DRAFTJS,
                ),
                TextEditorUtils.StorageType.MARKDOWN,
            );
        }
        result.log_topics.forEach(log_topic => {
            log_topic.details = convert(log_topic.details);
        });
        result.log_structures.forEach(log_structure => {
            log_structure.title_template = convert(log_structure.title_template);
        });
        result.log_events.forEach(log_event => {
            log_event.title = convert(log_event.title);
            log_event.details = convert(log_event.details);
        });
    }
    */

    const data = JSON.stringify(result, null, '\t');
    const hash = crypto.createHash('md5').update(data).digest('hex');

    try {
        const latestBackup = await this.invoke.call(this, 'backup-latest');
        if (latestBackup && hash === latestBackup.hash) {
            return { ...latestBackup, isUnchanged: true };
        }
    } catch (error) {
        assert(error.message === 'no backups found');
    }

    const [callback, promise] = getCallbackAndPromise();
    const filename = getFileName({ date, time, hash });
    fs.writeFile(path.join(this.config.backup.location, filename), data, callback);
    await promise;
    this.broadcast('backup-latest');
    return {
        filename, date, time, hash,
    };
};

ActionsRegistry['backup-latest'] = async function () {
    const [callback, promise] = getCallbackAndPromise();
    fs.readdir(this.config.backup.location, callback);
    let filenames = await promise;
    filenames = filenames.filter((filename) => filename.startsWith('backup-')).sort();
    if (!filenames.length) {
        return null;
    }
    assert(filenames.length, 'no backups found');
    const filename = filenames[filenames.length - 1];
    const components = parseFileName(filename);
    return { filename, ...components };
};

ActionsRegistry['backup-load'] = async function () {
    const latestBackup = await this.invoke.call(this, 'backup-latest');
    assert(latestBackup, 'at least one backup is required');

    const [callback, promise] = getCallbackAndPromise();
    fs.readFile(path.join(this.config.backup.location, latestBackup.filename), callback);
    const filedata = await promise;
    const data = JSON.parse(filedata);

    /*
    if (false) {
        // Associate existing topic with structure.
        let structure_id = Math.max(...data.log_structures.map((item) => item.id));
        const log_topic = data.log_topics.find((log_topic) => log_topic.name === 'Housekeeping');
        log_topic.parent_topic_id = null;
        log_topic.has_structure = true;
        const log_structure = {
            id: ++structure_id,
            group_id: 1,
            topic_id: log_topic.id,
            keys: '[]',
            title_template: '',
            is_periodic: false,
            is_major: false,
        };
        data.log_structures.push(log_structure);
        const event_ids = data.log_events_to_log_topics
            .filter((edge) => edge.topic_id === log_topic.id)
            .map((edge) => edge.event_id);
        data.log_events
            .filter((log_event) => event_ids.includes(log_event.id))
            .forEach((log_event) => {
                log_event.structure_id = log_structure.id;
                log_event.structure_values = '[]';
            });
    }
    */

    // This is where we can transform the input data to fix compatibility!
    await awaitSequence(this.database.getModelSequence(), async (model) => {
        const items = data[model.name];
        await model.bulkCreate(items, { transaction: this.transaction });
    });
    return latestBackup;
};

ActionsRegistry['backup-delete'] = async function ({ filename }) {
    const [callback, promise] = getCallbackAndPromise();
    fs.unlink(path.join(this.config.backup.location, filename), callback);
    return promise;
};
