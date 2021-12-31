import assert from 'assert';
import { TypeaheadOptions } from '../Common';
import { getVirtualID } from '../../common/data_types';

const NO_STRUCTURE_ITEM = {
    __type__: 'log-structure',
    __id__: 0,
    name: 'No Structure',
};

const EVENT_TITLE_ITEM_TYPE = 'log-event-title';
const EVENT_TITLE_ITEM_PREFIX = 'Title: ';

class LogEventOptions {
    static get(prefixOptions) {
        prefixOptions = [...prefixOptions, NO_STRUCTURE_ITEM];
        return new TypeaheadOptions({
            serverSideOptions: [
                { name: 'log-topic' },
                { name: 'log-structure' },
            ],
            prefixOptions,
            computedOptionTypes: [EVENT_TITLE_ITEM_TYPE],
            getComputedOptions: async (query) => {
                const options = [];
                if (query) {
                    options.push({
                        __type__: EVENT_TITLE_ITEM_TYPE,
                        __id__: getVirtualID(),
                        name: EVENT_TITLE_ITEM_PREFIX + query,
                    });
                }
                return options;
            },
            onSelect: (option) => {
                if (option && option.getItem) {
                    return option.getItem(option);
                }
                return undefined;
            },
        });
    }

    static getTypeToActionMap(extraOptions) {
        const result = {
            'log-structure': (item, where, extra) => {
                // This also handles NO_STRUCTURE_ITEM.
                assert(!Object.prototype.hasOwnProperty.call(where, 'logStructure'));
                where.logStructure = item.__id__ ? item : null;
                extra.searchView = true;
            },
            'log-topic': (item, where, extra) => {
                if (!where.logTopics) {
                    where.logTopics = [];
                }
                where.logTopics.push(item);
                extra.searchView = true;
            },
            [EVENT_TITLE_ITEM_TYPE]: (item, where, extra) => {
                where.title = item.name.substring(EVENT_TITLE_ITEM_PREFIX.length);
                extra.searchView = true;
            },
        };
        if (extraOptions) {
            extraOptions.forEach((item) => {
                assert(typeof item.apply === 'function', `Missing apply method on ${item}`);
                result[item.__type__] = item.apply;
            });
        }
        return result;
    }

    static extractData(items, typeToActionMap, defaultWhere) {
        const where = { ...defaultWhere };
        const extra = {};
        items.forEach((item) => {
            const action = typeToActionMap[item.__type__];
            if (action) {
                action(item, where, extra);
            } else {
                assert(false, `Unable to process ${JSON.stringify(item)}`);
            }
        });
        return { where, extra };
    }
}

export default LogEventOptions;
