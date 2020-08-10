/* eslint-disable func-names */

import { LogStructure, filterAsync } from '../data';
import ActionsRegistry from './ActionsRegistry';

ActionsRegistry['latest-log-event'] = async function (input) {
    return this.database.findOne(
        'LogEvent',
        {
            structure_id: input.logStructure.id,
            date: { [this.database.Op.ne]: null },
        },
        [['date', 'DESC']],
    );
};

ActionsRegistry['reminder-sidebar'] = async function (input) {
    const logStructureGroups = await this.invoke.call(this, 'log-structure-group-list', {
        ordering: true,
    });
    const periodicLogStructures = await this.invoke.call(this, 'log-structure-list', {
        where: { is_periodic: true },
        ordering: true,
    });
    let reminderGroups = await Promise.all(
        logStructureGroups.map(async (logStructureGroup) => {
            const logStructures = await filterAsync(
                periodicLogStructures.filter(
                    (logStructure) => logStructure.logStructureGroup.id === logStructureGroup.id,
                ),
                async (logStructure) => LogStructure.reminderCheck.call(this, logStructure),
            );
            if (!logStructures.length) {
                return null;
            }
            return { ...logStructureGroup, items: logStructures };
        }),
    );
    reminderGroups = reminderGroups.filter((reminderGroup) => reminderGroup);

    const logEvents = await this.invoke.call(this, 'log-event-list', {
        where: {
            is_complete: false,
        },
    });
    if (logEvents.length) {
        reminderGroups.push({ id: 'incomplete', name: 'Incomplete', items: logEvents });
    }

    return reminderGroups;
};

ActionsRegistry['reminder-complete'] = async function (input) {
    const { logEvent: inputLogEvent, logStructure: inputLogStructure } = input;
    const result = {};
    result.logEvent = await this.invoke.call(this, 'log-event-upsert', inputLogEvent);
    if (inputLogStructure) {
        inputLogStructure.suppressUntilDate = LogStructure.getSuppressUntilDate.call(
            this,
            inputLogStructure,
        );
        result.logStructure = await this.invoke.call(
            this,
            'log-structure-upsert',
            inputLogStructure,
        );
    }
    this.broadcast('reminder-sidebar');
    return result;
};

ActionsRegistry['reminder-dismiss'] = async function (input) {
    const { logStructure: inputLogStructure } = input;
    inputLogStructure.suppressUntilDate = LogStructure.getSuppressUntilDate.call(
        this,
        inputLogStructure,
    );
    const outputLogStructure = await this.invoke.call(
        this,
        'log-structure-upsert',
        inputLogStructure,
    );
    this.broadcast('reminder-sidebar');
    return { logStructure: outputLogStructure };
};
