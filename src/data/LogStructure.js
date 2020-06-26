
import assert from '../common/assert';
import LogKey from './LogKey';
import TextEditorUtils from '../common/TextEditorUtils';
import Base from './Base';
import { INCOMPLETE_KEY, getVirtualID, isVirtualItem } from './Utils';

/*
{
    "blocks": [
        {
            "key": "39enp",
            "text": "Distance / Time",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [],
            "entityRanges": [
                {
                    "offset": 0,
                    "length": 8,
                    "key": 0
                },
                {
                    "offset": 11,
                    "length": 4,
                    "key": 1
                }
            ],
            "data": {}
        }
    ],
    "entityMap": {
        "0": {
            "type": "mention",
            "mutability": "SEGMENTED",
            "data": {
                "mention": {
                    "id": -3,
                    "name": "Distance",
                    "type": "integer"
                }
            }
        },
        "1": {
            "type": "#mention",
            "mutability": "SEGMENTED",
            "data": {
                "mention": {
                    "id": -4,
                    "name": "Time",
                    "type": "integer"
                }
            }
        }
    }
}
*/

function createStructureTemplate(value, logKeys) {
    // Used for bootstrap only.

    const editorContent = {
        blocks: [
            {
                key: 'key00',
                text: '',
                type: 'unstyled',
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
        ],
        entityMap: {},
    };
    const block = editorContent.blocks[0];
    let nextEntityKey = 0;

    Array.from(value.matchAll(/(?:\$\d+|[^$]+)/g)).forEach(([part]) => {
        if (part.startsWith('$')) {
            const logKeyIndex = parseInt(part.substring(1), 10) - 1;
            const logKey = logKeys[logKeyIndex];
            const entityKey = nextEntityKey;
            nextEntityKey += 1;
            block.entityRanges.push({
                key: entityKey,
                offset: block.text.length,
                length: logKey.name.length,
            });
            editorContent.entityMap[entityKey] = {
                type: 'mention',
                mutability: 'SEGMENTED',
                data: { mention: logKey },
            };
            block.text += logKey.name;
        } else {
            block.text += part;
        }
    });

    return TextEditorUtils.serialize(editorContent);
}

function updateStructureTemplate(value, before, after) {
    if (!value) {
        return value;
    }
    const mapping = {};
    before.forEach((item, index) => {
        mapping[item.id] = after[index];
    });

    const editorContent = TextEditorUtils.deserialize(value);

    const block = editorContent.blocks[0];
    let prevIndex = 0;
    let text = '';
    const entityRanges = [];
    block.entityRanges.forEach((entityRange) => {
        assert(prevIndex <= entityRange.offset);
        text += block.text.substring(prevIndex, entityRange.offset);
        prevIndex = entityRange.offset + entityRange.length;
        const entity = editorContent.entityMap[entityRange.key];
        entity.data.mention = mapping[entity.data.mention.id];
        entityRanges.push({
            offset: text.length,
            length: entity.data.mention.name.length,
            key: entityRange.key,
        });
        text += entity.data.mention.name;
    });
    block.entityRanges = entityRanges;
    block.text = text + block.text.substr(prevIndex);

    return TextEditorUtils.serialize(editorContent);
}

function materializeStructureTemplate(template, logValues) {
    const mapping = {};
    logValues.forEach((logValue) => {
        mapping[logValue.logKey.id] = logValue.data || '???';
    });

    const editorContent = TextEditorUtils.deserialize(template);
    const block = editorContent.blocks[0];
    let prevIndex = 0;
    let result = '';
    block.entityRanges.forEach((entityRange) => {
        assert(prevIndex <= entityRange.offset);
        result += block.text.substring(prevIndex, entityRange.offset);
        prevIndex = entityRange.offset + entityRange.length;
        const entity = editorContent.entityMap[entityRange.key];
        result += mapping[entity.data.mention.id];
    });
    result += block.text.substr(prevIndex);

    result = Array.from(result.matchAll(/(?:\{[^}]*\}|[^{}]*)/g))
        .map(([part]) => {
            if (part.startsWith('{') && part.endsWith('}')) {
                try {
                    // eslint-disable-next-line no-eval
                    return eval(part.substring(1, part.length - 1)).toString();
                } catch (error) {
                    return part;
                }
            } else {
                return part;
            }
        })
        .join('');

    return createStructureTemplate(result, []);
}

class LogStructure extends Base {
    static createVirtual() {
        return {
            __type__: 'log-structure',
            id: getVirtualID(),
            name: '',
            logKeys: [],
            titleTemplate: '',
        };
    }

    static async loadStructureEdges(id) {
        const edges = await this.database.getEdges(
            'LogStructureToLogKey',
            'structure_id',
            id,
            this.transaction,
        );
        return Promise.all(
            edges.map((edge) => LogKey.load.call(this, edge.key_id)),
        );
    }

    static async typeahead() {
        const logStructures = await this.database.findAll(
            'LogStructure', {}, this.transaction,
        );
        return logStructures.map((logStructure) => ({
            __type__: 'log-structure',
            id: logStructure.id,
            name: logStructure.name,
            [INCOMPLETE_KEY]: true,
        }));
    }

    static async validateInternal(inputLogStructure) {
        const logKeysResults = await this.validateRecursiveList(LogKey, '.logKeys', inputLogStructure.logKeys);
        return [
            this.validateNonEmptyString('.name', inputLogStructure.name),
            ...logKeysResults,
        ];
    }

    static async load(id) {
        const logStructure = await this.database.findByPk('LogStructure', id, this.transaction);
        const logStructureEdges = await this.database.getEdges(
            'LogStructureToLogKey',
            'structure_id',
            id,
            this.transaction,
        );
        const outputLogKeys = await Promise.all(
            logStructureEdges.map((edge) => LogKey.load.call(this, edge.key_id)),
        );
        return {
            __type__: 'log-structure',
            id: logStructure.id,
            name: logStructure.name,
            logKeys: outputLogKeys,
            titleTemplate: logStructure.title_template,
        };
    }

    static async save(inputLogStructure) {
        const logKeys = await Promise.all(
            inputLogStructure.logKeys.map(async (inputLogKey) => {
                let logKey;
                if (isVirtualItem(inputLogKey)) {
                    logKey = await this.database.createOrFind(
                        'LogKey',
                        { name: inputLogKey.name },
                        { type: inputLogKey.type },
                        this.transaction,
                    );
                } else {
                    logKey = await this.database.update(
                        'LogKey',
                        { id: inputLogKey.id, name: inputLogKey.name },
                        this.transaction,
                    );
                }
                return {
                    id: logKey.id,
                    name: logKey.name,
                    type: logKey.type,
                };
            }),
        );
        const fields = {
            id: inputLogStructure.id,
            name: inputLogStructure.name,
            title_template: updateStructureTemplate(
                inputLogStructure.titleTemplate,
                inputLogStructure.logKeys,
                logKeys,
            ),
        };
        const logStructure = await this.database.createOrUpdate(
            'LogStructure', fields, this.transaction,
        );
        await this.database.setEdges(
            'LogStructureToLogKey',
            'structure_id',
            logStructure.id,
            'key_id',
            logKeys.reduce((result, logKey, index) => {
                // eslint-disable-next-line no-param-reassign
                result[logKey.id] = { ordering_index: index };
                return result;
            }, {}),
            this.transaction,
        );
        return logStructure.id;
    }
}

export { createStructureTemplate, updateStructureTemplate, materializeStructureTemplate };
export default LogStructure;
