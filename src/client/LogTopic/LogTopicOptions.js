import assert from 'assert';

import { getVirtualID, isRealItem, LogTopic } from '../../common/data_types';
import { Coordinator, TypeaheadOptions } from '../Common';
import LogTopicEditor from './LogTopicEditor';

const CREATE_ITEM = {
    __type__: 'log-topic',
    __id__: getVirtualID(),
    name: 'Create New Topic ...',
    getItem(_option, parentLogTopic) {
        return new Promise((resolve) => {
            Coordinator.invoke('modal-editor', {
                dataType: 'log-topic',
                EditorComponent: LogTopicEditor,
                valueKey: 'logTopic',
                value: LogTopic.createVirtual({ parentLogTopic }),
                onClose: (newLogTopic) => {
                    if (newLogTopic && isRealItem(newLogTopic)) {
                        resolve(newLogTopic);
                    } else {
                        resolve(null);
                    }
                },
            });
        });
    },
};

class LogTopicOptions {
    static get({
        allowCreation, parentLogTopic, beforeSelect, afterSelect,
    } = {}) {
        return new TypeaheadOptions({
            serverSideOptions: [{ name: 'log-topic', where: { parentLogTopic } }],
            suffixOptions: [allowCreation ? CREATE_ITEM : null].filter((item) => !!item),
            onSelect: async (option) => {
                if (option.getItem) {
                    if (beforeSelect) beforeSelect();
                    const result = await option.getItem(option, parentLogTopic);
                    if (afterSelect) afterSelect();
                    return result;
                }
                return undefined;
            },
        });
    }

    static getTypeToActionMap() {
        return {
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

export default LogTopicOptions;
