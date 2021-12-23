import assert from 'assert';
import { TypeaheadOptions } from '../Common';

class LogStructureOptions {
    static get(logMode) {
        const where = { logMode: logMode || undefined };
        return new TypeaheadOptions({
            serverSideOptions: [
                { name: 'log-structure', args: { where } },
                { name: 'log-topic', args: { where } },
            ],
        });
    }

    static getTypeToActionMap() {
        return {
            'log-structure': (item, where, extra) => {
                if (!where.id) where.id = [];
                where.id.push(item.id);
                extra.searchView = true;
            },
            'log-topic': (item, where, extra) => {
                if (!where.logTopics) {
                    where.logTopics = [];
                }
                where.logTopics.push(item);
                extra.searchView = true;
            },
        };
    }

    static extractData(logMode, items, typeToActionMap) {
        const where = {
            logMode: logMode || undefined,
        };
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

export default LogStructureOptions;
