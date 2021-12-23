/* eslint-disable func-names */

import ActionsRegistry from './ActionsRegistry';

ActionsRegistry['settings-get'] = async function () {
    const result = {};
    const items = await this.database.findAll('Settings');
    items.forEach((item) => {
        result[item.key] = JSON.parse(item.value);
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
