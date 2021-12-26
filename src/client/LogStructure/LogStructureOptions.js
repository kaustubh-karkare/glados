import assert from 'assert';
import { TypeaheadOptions } from '../Common';

class LogStructureOptions {
    static get() {
        return new TypeaheadOptions({
            serverSideOptions: [
                { name: 'log-structure' },
                { name: 'log-topic' },
            ],
        });
    }

    static getTypeToActionMap() {
        return {
            'log-structure': (item, where, extra) => {
                if (!where.__id__) where.__id__ = [];
                where.__id__.push(item.__id__);
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

    static extractData(items, typeToActionMap) {
        const where = {};
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
