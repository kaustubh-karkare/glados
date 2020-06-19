
import assert from './assert';

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

function updateCategoryTemplate(value, before, after) {
    if (!value) {
        return value;
    }
    const mapping = {};
    before.forEach((item, index) => {
        mapping[item.id] = after[index];
    });

    const editorContent = JSON.parse(value);

    const block = editorContent.blocks[0];
    let prevIndex = 0;
    let text = "";
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

    return JSON.stringify(editorContent);
}

function materializeCategoryTemplate(template, logValues) {
    const mapping = {};
    logValues.forEach((logValue) => {
        mapping[logValue.logKey.id] = logValue.data || '???';
    })

    const editorContent = JSON.parse(template);
    const block = editorContent.blocks[0];
    let prevIndex = 0;
    let result = "";
    block.entityRanges.forEach((entityRange) => {
        assert(prevIndex <= entityRange.offset);
        result += block.text.substring(prevIndex, entityRange.offset);
        prevIndex = entityRange.offset + entityRange.length;
        const entity = editorContent.entityMap[entityRange.key];
        result += mapping[entity.data.mention.id];
    });
    result += block.text.substr(prevIndex);

    result = Array.from(result.matchAll(/(?:\{[^}]*\}|[^{}]*)/g))
        .map((result) => {
            const part = result[0];
            if (part.startsWith("{") && part.endsWith("}")) {
                try {
                    return eval(part.substring(1, part.length - 1)).toString();
                } catch (error) {
                    return part;
                }
            } else {
                return part;
            }
        })
        .join("");

    return result;
}

export { updateCategoryTemplate, materializeCategoryTemplate };
