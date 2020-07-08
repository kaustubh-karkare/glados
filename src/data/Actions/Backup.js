/* eslint-disable func-names */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import assert from '../../common/assert';
import deepcopy from '../../common/deepcopy';
import TextEditorUtils from '../../common/TextEditorUtils';
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
    const data = JSON.stringify(result, null, '\t');
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

    // Add book reminder: Dostoyevsky: Crime and Punishment

    let lastTopicId = data.log_topics[data.log_topics.length - 1].id;
    const reminderGroupIdToTopicId = {};
    data.log_reminder_groups.forEach((logReminderGroup) => {
        lastTopicId += 1;
        const topicId = lastTopicId;
        reminderGroupIdToTopicId[logReminderGroup.id] = topicId;
        data.log_topics.push({
            id: topicId,
            parent_topic_id: null,
            ordering_index: topicId,
            name: logReminderGroup.name,
            on_sidebar: false,
            details: '',
        });
    });
    data.log_topics.forEach((logTopic) => {
        Object.assign(logTopic, {
            is_major: true,
            structure_id: null,
            reminder_id: null,
        });
    });
    data.log_reminders.forEach((logReminder) => {
        if (logReminder.type === 'periodic') {
            lastTopicId += 1;
            const topicId = lastTopicId;
            const name = TextEditorUtils.extractPlainText(logReminder.title);
            if (name === 'Pranayama') { // This topic already exists.
                return;
            }
            data.log_topics.push({
                id: topicId,
                parent_topic_id: reminderGroupIdToTopicId[logReminder.group_id],
                ordering_index: topicId,
                name,
                on_sidebar: false,
                details: '',
                // new fields
                is_major: logReminder.is_major,
                structure_id: logReminder.structure_id,
            });
            logReminder.parent_topic_id = topicId;
        } else {
            assert(logReminder.structure_id === null);
            logReminder.parent_topic_id = reminderGroupIdToTopicId[logReminder.group_id];
        }
        delete logReminder.group_id;
        delete logReminder.structure_id;
        delete logReminder.is_major;
    });

    /*
    console.info(
        Object.entries(data.log_topics.reduce((result, log_topic) => {
            if (!(log_topic.name in result)) {
                result[log_topic.name] = 0;
            }
            result[log_topic.name] += 1;
            return result;
        }, {})).filter(([name, count]) => count > 1)
    );
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
    fs.unlink(path.join(location, filename), callback);
    return promise;
};

ActionsRegistry['data-mode-get'] = async function () {
    return (this.config.backup.load_on_startup ? 'test' : 'prod');
};

ActionsRegistry['data-mode-set'] = async function (dataMode) {
    const config = deepcopy(this.config);
    if (dataMode === 'test') {
        assert(!config.backup.load_on_startup);
        await this.invoke.call(this, 'backup-save');
        config.backup.load_on_startup = true;
    } else if (dataMode === 'prod') {
        assert(config.backup.load_on_startup);
        config.backup.load_on_startup = false;
    } else {
        assert(false, dataMode);
    }
    const [callback, promise] = getCallbackAndPromise();
    fs.writeFile(this.configPath, JSON.stringify(config, null, 4), callback);
    await promise;
};
