/* eslint-disable func-names */

import assert from 'assert';
import toposort from 'toposort';
import { asyncSequence } from '../../common/AsyncUtils';
import { getDataFormatVersion } from '../models';

const ActionsRegistry = {};

ActionsRegistry['database-load'] = async function () {
    // Since the database format might not be in-sync with the code,
    // use the QueryInterface to load the data, instead of models.
    const { sequelize } = this.database;
    const api = sequelize.getQueryInterface();
    const tableNames = await api.showAllTables();
    const data = {};
    await asyncSequence(tableNames, async (tableName) => {
        data[tableName] = await sequelize.query(
            `SELECT * FROM ${tableName}`,
            { type: sequelize.QueryTypes.SELECT },
        );
    });
    return data;
};

ActionsRegistry['database-save'] = async function (data) {
    await this.database.reset();
    await asyncSequence(this.database.getModelSequence(), async (model) => {
        const items = data[model.name] || [];
        if (model.name !== 'log_topics') {
            await asyncSequence(items, async (item) => {
                try {
                    await model.create(item, { transaction: this.database.transaction });
                } catch (error) {
                    // eslint-disable-next-line no-constant-condition
                    if (false) {
                        // eslint-disable-next-line no-console
                        console.error(model.name, item);
                    }
                    throw error;
                }
            });
        } else {
            await model.bulkCreate(items, { transaction: this.database.transaction });
        }
    });
};

const DATA_FORMAT_VERSION_KEY = '__data_format_version__';

ActionsRegistry['database-reset'] = async function ({ verbose = false } = {}) {
    await this.database.reset();
    await this.database.createOrUpdateItem('Settings', null, {
        key: DATA_FORMAT_VERSION_KEY,
        value: getDataFormatVersion(),
    });
    if (verbose) {
        // eslint-disable-next-line no-console
        console.info('Reset database!');
    }
};

ActionsRegistry['database-validate'] = async function ({ data: backupData, verbose } = {}) {
    const expectedValue = getDataFormatVersion();
    let actualValue = null;
    if (backupData) {
        const item = backupData.settings.find((row) => row.key === DATA_FORMAT_VERSION_KEY);
        actualValue = item.value;
    } else {
        const item = await this.database.findOne('Settings', { key: DATA_FORMAT_VERSION_KEY });
        actualValue = item.value;
    }
    assert(
        expectedValue === actualValue,
        `Data format version mismatch! Expected = ${expectedValue}, Actual = ${actualValue}`,
    );
    if (verbose) {
        // eslint-disable-next-line no-console
        console.info('Data format version validated!');
    }
};

ActionsRegistry['database-clear'] = async function () {
    // For some reason, calling "database-reset" causes SQLITE_READONLY error.
    // So this method is specifically designed for the demo video.
    const models = this.database.getModelSequence().slice().reverse();
    await asyncSequence(models, async (model) => {
        if (model.name === 'log_topics') {
            // Since topics can reference other topics, the order of deletion matters.
            // Using topological sort to avoid violating foreign key constraints.
            const logTopics = await model.findAll();
            const logTopicMap = {};
            const nodes = [];
            const edges = [];
            logTopics.forEach((logTopic) => {
                logTopicMap[logTopic.id] = logTopic;
                nodes.push(logTopic.id);
                if (logTopic.parent_topic_id) {
                    edges.push([logTopic.parent_topic_id, logTopic.id]);
                }
            });
            const result = toposort.array(nodes, edges).reverse();
            await asyncSequence(result, async (id) => {
                await logTopicMap[id].destroy();
            });
        }
        try {
            await model.sync({ force: true });
        } catch (error) {
            throw new Error(`${model.name} // ${error.message}`);
        }
    });
};

export default ActionsRegistry;
