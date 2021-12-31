/* eslint-disable func-names */

import assert from 'assert';

const ActionsRegistry = {};

const INTERNAL_SETTINGS_PREFIX = '_';

ActionsRegistry['settings-get'] = async function () {
    const result = {};
    const items = await this.database.findAll('Settings');
    items.forEach((item) => {
        if (!item.key.startsWith(INTERNAL_SETTINGS_PREFIX)) {
            result[item.key] = JSON.parse(item.value);
        }
    });
    return result;
};

ActionsRegistry['settings-set'] = async function (input) {
    const items = await this.database.findAll('Settings', { key: Object.keys(input) });
    const keyToItem = {};
    items.forEach((item) => {
        keyToItem[item.key] = item;
    });
    await Promise.all(Object.entries(input).map(async ([key, value]) => {
        assert(!key.startsWith(INTERNAL_SETTINGS_PREFIX));
        let item = keyToItem[key];
        if (value) {
            const fields = { key, value: JSON.stringify(value) };
            item = await this.database.createOrUpdateItem('Settings', item, fields);
        } else if (item) {
            await this.database.deleteByPk('Settings', item.id);
        }
    }));
    this.broadcast('settings-get');
};

export default ActionsRegistry;
