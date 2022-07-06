import RichTextUtils from '../RichTextUtils';
import Enum from './enum';
import { getPartialItem, getVirtualID } from './utils';
import { validateNonEmptyString } from './validation';

const LogKeyType = Enum([
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

class LogKey {
    static createVirtual() {
        return {
            __type__: 'log-structure-key',
            __id__: getVirtualID(),
            name: '',
            type: LogKeyType.STRING,
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
        if (inputLogKey.type === LogKeyType.ENUM) {
            results.push([
                '.enumValues',
                inputLogKey.enumValues.length > 0,
                'must be provided!',
            ]);
        } if (inputLogKey.type === LogKeyType.LOG_TOPIC) {
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
        const KeyOption = LogKeyType[inputLogKey.type];
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
        if (inputLogKey.type === LogKeyType.ENUM && inputLogKey.enumValues) {
            result.enum_values = inputLogKey.enumValues;
        }
        if (inputLogKey.type === LogKeyType.LOG_TOPIC && inputLogKey.parentLogTopic) {
            result.parent_topic_id = inputLogKey.parentLogTopic.__id__;
        }
        return result;
    }

    static async updateLogTopicsInLogTopicType(inputLogKey) {
        const originalLogTopics = [];
        originalLogTopics.push(inputLogKey.parentLogTopic);
        if (inputLogKey.value) {
            originalLogTopics.push(inputLogKey.value);
        }
        const updatedLogTopics = await Promise.all(
            originalLogTopics.map((originalLogTopic) => this.invoke.call(
                this,
                'log-topic-load-partial',
                originalLogTopic,
            )),
        );
        inputLogKey.parentLogTopic = getPartialItem(updatedLogTopics[0]);
        if (inputLogKey.value) {
            inputLogKey.value = getPartialItem(updatedLogTopics[1]);
        }
        return updatedLogTopics.map((logTopic) => logTopic.__id__);
    }

    static async updateLogTopicsInRichTextLineType(inputLogKey) {
        const originalLogTopics = Object.values(RichTextUtils.extractMentions(inputLogKey.value, 'log-topic'));
        const updatedLogTopics = await Promise.all(
            originalLogTopics.map((originalLogTopic) => this.invoke.call(
                this,
                'log-topic-load-partial',
                originalLogTopic,
            )),
        );
        inputLogKey.value = RichTextUtils.updateDraftContent(
            inputLogKey.value,
            originalLogTopics,
            updatedLogTopics,
        );
        return updatedLogTopics.map((logTopic) => logTopic.__id__);
    }

    static async updateLogTopics(inputLogKey) {
        if (inputLogKey.type === LogKeyType.LOG_TOPIC) {
            return LogKey.updateLogTopicsInLogTopicType.call(this, inputLogKey);
        } if (inputLogKey.type === LogKeyType.RICH_TEXT_LINE) {
            return LogKey.updateLogTopicsInRichTextLineType.call(this, inputLogKey);
        }
        return [];
    }
}

LogKey.Type = LogKeyType;

export default LogKey;
