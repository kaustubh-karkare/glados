/* eslint-disable func-names */

import { LogStructure } from '../data';
import ActionsRegistry from './ActionsRegistry';

ActionsRegistry['reminder-sidebar'] = async function (input) {
    const reminderGroups = [];

    const logStructureGroups = await this.invoke.call(this, 'log-structure-group-list', {
        ordering: true,
    });
    const periodicLogStructures = await this.invoke.call(this, 'log-structure-list', {
        where: {
            frequency: { [this.database.Op.ne]: null },
        },
        ordering: true,
    });
    logStructureGroups.forEach((logStructureGroup) => {
        const logStructures = periodicLogStructures
            .filter((logStructure) => logStructure.logStructureGroup.id === logStructureGroup.id)
            .filter((logStructure) => LogStructure.periodicCheck(logStructure));
        if (logStructures.length) {
            reminderGroups.push({ ...logStructureGroup, items: logStructures });
        }
    });

    const logEvents = await this.invoke.call(this, 'log-event-list', {
        where: {
            is_complete: false,
        },
    });

    reminderGroups.push({ id: 'incomplete', name: 'Incomplete', items: logEvents });
    return reminderGroups;
};

ActionsRegistry['reminder-complete'] = async function (input) {
    const { logEvent: inputLogEvent, logStructure: inputLogStructure } = input;
    const result = {};
    result.logEvent = await this.invoke.call(this, 'log-event-upsert', inputLogEvent);
    if (inputLogStructure) {
        result.logStructure = await this.invoke.call(this, 'log-structure-upsert', inputLogStructure);
    }
    this.broadcast('reminder-sidebar');
    return result;
};

ActionsRegistry['reminder-dismiss'] = async function (input) {
    const { logStructure: inputLogStructure } = input;
    const outputLogStructure = await this.invoke.call(this, 'log-structure-upsert', inputLogStructure);
    this.broadcast('reminder-sidebar');
    return { logStructure: outputLogStructure };
};
