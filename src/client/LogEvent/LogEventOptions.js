import assert from 'assert';
import { TypeaheadOptions } from '../Common';
import { getVirtualID } from '../../data';

const NO_STRUCTURE_ITEM = {
    __type__: 'no-structure',
    id: getVirtualID(),
    name: 'No Structure',
};

const EVENT_TITLE_ITEM_TYPE = 'log-event-title';
const EVENT_TITLE_ITEM_PREFIX = 'Title: ';

class LogEventOptions {
    static get(logMode, prefixOptions) {
        const where = { logMode: logMode || undefined };
        prefixOptions = [...prefixOptions, NO_STRUCTURE_ITEM];
        return new TypeaheadOptions({
            serverSideOptions: [
                { name: 'log-topic', args: { where } },
                { name: 'log-structure', args: { where } },
            ],
            prefixOptions,
            computedOptionTypes: [EVENT_TITLE_ITEM_TYPE],
            getComputedOptions: async (query) => {
                const options = [];
                if (query) {
                    options.push({
                        __type__: EVENT_TITLE_ITEM_TYPE,
                        id: getVirtualID(),
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

    static getEventsQuery(logMode, items) {
        const where = {
            logMode: logMode || undefined,
            isComplete: true,
            logLevel: [2, 3],
        };

        const extra = {
            // This flags determine which view to use in LogEventSearch.
            searchResultMode: false,
            incompleteMode: false,
        };

        items.forEach((item) => {
            if (item.__type__ === 'log-structure') {
                assert(!where.logStructure);
                where.logStructure = item;
                extra.searchResultMode = true;
            } else if (item.__type__ === NO_STRUCTURE_ITEM.__type__) {
                assert(!where.logStructure);
                where.logStructure = null;
                extra.searchResultMode = true;
            } else if (item.__type__ === 'log-topic') {
                if (!where.logTopics) {
                    where.logTopics = [];
                }
                where.logTopics.push(item);
                extra.searchResultMode = true;
            } else if (item.__type__ === EVENT_TITLE_ITEM_TYPE) {
                where.title = item.name.substring(EVENT_TITLE_ITEM_PREFIX.length);
                extra.searchResultMode = true;
            } else if (typeof item.apply === 'function') {
                item.apply(item, where, extra);
            } else {
                assert(false, item);
            }
        });
        return { where, ...extra };
    }
}

export default LogEventOptions;
