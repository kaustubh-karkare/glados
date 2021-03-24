import { Coordinator, TypeaheadOptions } from '../Common';
import { LogTopic, getVirtualID, isRealItem } from '../../data';
import LogTopicEditor from './LogTopicEditor';

const CREATE_ITEM = {
    __type__: 'log-topic',
    id: getVirtualID(),
    name: 'Create New Topic ...',
    getItem(option, parentLogTopic) {
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
    static get({ parentLogTopic, beforeSelect, afterSelect } = {}) {
        return new TypeaheadOptions({
            serverSideOptions: [{ name: 'log-topic', where: { parentLogTopic } }],
            suffixOptions: [CREATE_ITEM],
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
}

export default LogTopicOptions;
