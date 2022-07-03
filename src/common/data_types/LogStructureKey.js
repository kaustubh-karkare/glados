import RichTextUtils from '../RichTextUtils';
import Enum from './enum';
import { getVirtualID } from './utils';
import { validateNonEmptyString } from './validation';

const LogStructureKeyType = Enum([
    {
        value: 'string',
        label: 'String',
        validator: async () => true,
        getDefault: () => '',
    },
    {
        value: 'string_list',
        label: 'String List',
        validator: async (value) => Array.isArray(value),
        getDefault: () => [],
    },
    {
        value: 'integer',
        label: 'Integer',
        validator: async (value) => !!value.match(/^\d+$/),
        getDefault: () => '',
    },
    {
        value: 'number',
        label: 'Number',
        validator: async (value) => !!value.match(/^\d+(?:\.\d+)?$/),
        getDefault: () => '',
    },
    {
        value: 'time',
        label: 'Time',
        validator: async (value) => !!value.match(/^\d{2}:\d{2}$/),
        getDefault: () => '',
    },
    {
        value: 'yes_or_no',
        label: 'Yes / No',
        validator: async (value) => !!value.match(/^(?:yes|no)$/),
        getDefault: () => 'no',
    },
    {
        value: 'enum',
        label: 'Enum',
        validator: async (value, logKey) => logKey.enumValues.includes(value),
        getDefault: (logKey) => logKey.enumValues[0],
    },
    {
        value: 'log_topic',
        label: 'Topic',
        validator: async (value, logKey, that) => {
            const logTopic = await that.invoke.call(that, 'log-topic-load', value);
            return logTopic.parentLogTopic.__id__ === logKey.parentLogTopic.__id__;
        },
        getDefault: () => null,
    },
    {
        value: 'rich_text_line',
        label: 'Rich Text Line',
        validator: async (value) => true,
        getDefault: () => null,
    },
]);

class LogStructureKey {
    static createVirtual() {
        return {
            __type__: 'log-structure-key',
            __id__: getVirtualID(),
            name: '',
            type: LogStructureKeyType.STRING,
            isOptional: false,
            template: null,
            enumValues: [],
            parentLogTopic: null,
        };
    }

    static async validate(inputLogKey) {
        const results = [];
        results.push(validateNonEmptyString('.name', inputLogKey.name));
        results.push(validateNonEmptyString('.type', inputLogKey.type));
        if (inputLogKey.type === LogStructureKeyType.ENUM) {
            results.push([
                '.enumValues',
                inputLogKey.enumValues.length > 0,
                'must be provided!',
            ]);
        } if (inputLogKey.type === LogStructureKeyType.LOG_TOPIC) {
            results.push([
                '.parentLogTopic',
                inputLogKey.parentLogTopic,
                'must be provided!',
            ]);
        }
        return results;
    }

    static async validateValue(inputLogKey, index) {
        if (inputLogKey.isOptional && !inputLogKey.value) return null;
        const name = `.logKeys[${index}].value`;
        if (!inputLogKey.value) return [name, false, 'must be non-empty.'];
        const KeyOption = LogStructureKeyType[inputLogKey.type];
        let isValid = await KeyOption.validator(inputLogKey.value, inputLogKey, this);
        if (!isValid && KeyOption.maybeFix) {
            const fixedValue = KeyOption.maybeFix(inputLogKey.value, inputLogKey);
            if (fixedValue) {
                inputLogKey.value = fixedValue;
                isValid = true;
            }
        }
        return [name, isValid, 'fails validation for specified type.'];
    }

    static async load(rawLogKey, index) {
        let parentLogTopic = null;
        if (rawLogKey.parent_topic_id) {
            // Normally, we would use "log-topic-load" here, but it does a lot of extra work.
            const logTopic = await this.database.findByPk('LogTopic', rawLogKey.parent_topic_id);
            parentLogTopic = {
                __type__: 'log-topic',
                __id__: logTopic.id,
                name: logTopic.name,
            };
        }
        return {
            __type__: 'log-structure-key',
            __id__: index,
            name: rawLogKey.name,
            type: rawLogKey.type,
            template: rawLogKey.template || null,
            isOptional: rawLogKey.is_optional || false,
            enumValues: rawLogKey.enum_values || [],
            parentLogTopic,
        };
    }

    static save(inputLogKey) {
        const result = {
            name: inputLogKey.name,
            type: inputLogKey.type,
        };
        if (inputLogKey.isOptional) {
            result.is_optional = true;
        }
        if (inputLogKey.template) {
            result.template = inputLogKey.template;
        }
        if (inputLogKey.type === LogStructureKeyType.ENUM && inputLogKey.enumValues) {
            result.enum_values = inputLogKey.enumValues;
        }
        if (inputLogKey.type === LogStructureKeyType.LOG_TOPIC && inputLogKey.parentLogTopic) {
            result.parent_topic_id = inputLogKey.parentLogTopic.__id__;
        }
        return result;
    }

    static extractLogTopics(inputLogKey) {
        let logTopics = {};
        if (inputLogKey.type === LogStructureKeyType.LOG_TOPIC && inputLogKey.value) {
            logTopics[inputLogKey.value.__id__] = inputLogKey.value;
        } else if (inputLogKey.type === LogStructureKeyType.RICH_TEXT_LINE) {
            logTopics = {
                ...logTopics,
                ...RichTextUtils.extractMentions(inputLogKey.value, 'log-topic'),
            };
        }
        return logTopics;
    }
}

LogStructureKey.Type = LogStructureKeyType;

export default LogStructureKey;
