/* eslint-disable func-names */

import assert from '../common/assert';
import { LogReminder, getDataTypeMapping } from './Mapping';
import { getTodayLabel } from '../common/DateUtils';
import { getVirtualID } from './Utils';

const ActionsRegistry = {};

Object.entries(getDataTypeMapping()).forEach((pair) => {
    const [name, DataType] = pair;
    ActionsRegistry[`${name}-list`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.list.call(context, input);
    };
    ActionsRegistry[`${name}-typeahead`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.typeahead.call(context, input);
    };
    ActionsRegistry[`${name}-validate`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.validate.call(context, input);
    };
    ActionsRegistry[`${name}-load`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.load.call(context, input.id);
    };
    ActionsRegistry[`${name}-reorder`] = async function (input) {
        const context = { ...this, DataType };
        return DataType.reorder.call(context, input);
    };
    ActionsRegistry[`${name}-upsert`] = async function (input) {
        const context = { ...this, DataType };
        const id = await DataType.save.call(context, input);
        return DataType.load.call(context, id);
    };
    ActionsRegistry[`${name}-delete`] = async function (id) {
        const context = { ...this, DataType };
        return DataType.delete.call(context, id);
    };
});

ActionsRegistry.dates = async function () {
    const results = await this.database.count('LogEntry', {}, ['date'], this.transaction);
    const dates = new Set(results.filter((result) => result.date).map((result) => result.date));
    dates.add(getTodayLabel());
    return Array.from(dates).sort();
};

ActionsRegistry['reminder-list'] = async function (input) {
    const { type } = input.logReminderGroup;
    const logReminders = await this.database.findAll(
        'LogReminder',
        { group_id: input.logReminderGroup.id },
        this.transaction,
    );
    const logEntryIds = logReminders
        .filter((logReminder) => LogReminder.check(type, logReminder))
        .map((logReminder) => logReminder.entry_id);
    const outputLogEntries = await ActionsRegistry['log-entry-list'].call(this, {
        selector: { id: { [this.database.Op.in]: logEntryIds } },
        ordering: true,
    });
    return outputLogEntries;
};

ActionsRegistry['reminder-complete'] = async function (input) {
    const inputLogEntry = input.logEntry;
    const updatedLogEntry = {
        ...inputLogEntry,
        date: getTodayLabel(),
        logReminder: null,
    };
    const { type } = inputLogEntry.logReminder.logReminderGroup;
    if (
        type === LogReminder.Type.UNSPECIFIED
        || type === LogReminder.Type.DEADLINE
    ) {
        // update the existing entry
    } else if (
        type === LogReminder.Type.PERIODIC
    ) {
        inputLogEntry.logReminder.lastUpdate = updatedLogEntry.date;
        await ActionsRegistry['log-entry-upsert'].call(this, inputLogEntry);
        // duplicate the existing entry
        updatedLogEntry.id = getVirtualID();
    } else {
        assert(false, type);
    }
    const outputLogEntry = await ActionsRegistry['log-entry-upsert'].call(this, updatedLogEntry);
    return { logEntry: outputLogEntry };
};

export default class {
    constructor(database) {
        this.database = database;
    }

    invoke(name, input) {
        try {
            return this.database.sequelize.transaction(async (transaction) => {
                const context = { database: this.database, transaction };
                const output = await ActionsRegistry[name].call(context, input);
                return output;
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            throw error;
        }
    }

    register(api) {
        Object.keys(ActionsRegistry).forEach((name) => {
            api.register(name, (input) => this.invoke(name, input));
        });
    }
}
