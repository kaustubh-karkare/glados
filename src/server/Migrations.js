/* eslint-disable func-names */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { awaitSequence, callbackToPromise } from '../data';
import ActionsRegistry from './ActionsRegistry';

const MIGRATIONS_PATH = path.resolve(__dirname, '../data/migrations');

ActionsRegistry['migration-check'] = async function () {
    const getAvailableMigrations = async () => {
        const filelist = await callbackToPromise(fs.readdir, MIGRATIONS_PATH);
        return filelist.filter((filename) => !filename.startsWith('.'));
    };
    const getCompletedMigrations = async () => {
        try {
            const items = await this.database.findAll('SequelizeMeta');
            return items.map((item) => item.name);
        } catch (error) {
            assert(error.toString().includes('SQLITE_ERROR: no such table'));
            return [];
        }
    };

    const [availableMigrations, completedMigrations] = await Promise.all([
        getAvailableMigrations(),
        getCompletedMigrations(),
    ]);

    const pendingMigrations = [];
    availableMigrations.sort().forEach((name) => {
        if (completedMigrations.includes(name)) {
            assert(!pendingMigrations.length);
        } else {
            pendingMigrations.push(name);
        }
    });

    return { pendingMigrations };
};

ActionsRegistry['migration-perform'] = async function ({ logging } = {}) {
    const { pendingMigrations } = await this.invoke.call(this, 'migration-check');

    if (!pendingMigrations.length) {
        if (logging) {
            // eslint-disable-next-line no-console
            console.info('No data migrations necessary!');
        }
        return;
    }

    // TODO: This will fail since the schema of the database is different from code.
    const data = await this.invoke.call(this, 'backup-data-load');
    await this.invoke.call(this, 'backup-file-save', { data }); // in case of problems

    await awaitSequence(pendingMigrations, async (name) => {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const migration = require(path.join(MIGRATIONS_PATH, name));
        migration.up(data);
        if (!data.SequelizeMeta) {
            data.SequelizeMeta = [];
        }
        if (logging) {
            // eslint-disable-next-line no-console
            console.info(`Applying data migration: ${name}`);
        }
        data.SequelizeMeta.push({ name });
    });

    await this.invoke.call(this, 'backup-data-save', { data });
};
