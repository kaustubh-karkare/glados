
import {
    ContentState, SelectionState, convertFromRaw, convertToRaw, Modifier,
} from 'draft-js';

/*
Link = [text](link)
Key = \$\d+
Tag = ?
People = ?
Project = ?
*/

const PLUGIN_NAME = 'mention';

function extractLogTags(content) {
    // There's no way to extract the list of entity-keys from the contentState API.
    // And so I'm just accessing the raw data here.
    const logTags = {};
    Object.values(content.entityMap)
        .filter((entity) => entity.type === 'mention' || entity.type === '#mention')
        .forEach((entity) => {
            const logTag = entity.data.mention;
            logTags[logTag.id] = logTag;
        });
    return logTags;
}

function convertDraftContentToPlainText(content, items) {
    const mapping = {
        mention: '$',
    };
    const contentState = convertFromRaw(content);
    const contentBlock = contentState.getFirstBlock();
    const text = contentBlock.getText();

    const relativeIndex = {};
    items.forEach((item, index) => {
        relativeIndex[item.id] = index + 1;
    });

    let previous = 0;
    let currentEntity;
    let result = '';
    contentBlock.findEntityRanges((charMetadata) => {
        const entityKey = charMetadata.getEntity();
        if (entityKey) {
            currentEntity = contentState.getEntity(entityKey);
            return true;
        }
        return false;
    }, (start, end) => {
        result += text.substring(previous, start);
        const itemId = currentEntity.getData()[PLUGIN_NAME].id;
        result += mapping[currentEntity.getType()] + relativeIndex[itemId];
        previous = end;
    });
    result += text.substring(previous, text.length);
    return result;
}

function convertPlainTextToDraftContent(value, items) {
    let text = '';
    const pendingEntities = [];
    for (let ii = 0; ii < value.length; ii += 1) {
        if (value[ii] === '$') {
            ii += 1;
            // Assumption: Single digit.
            const index = parseInt(value[ii], 10) - 1;
            const item = items[index];
            pendingEntities.push([
                text.length,
                text.length + item.name.length,
                { [PLUGIN_NAME]: item },
            ]);
            text += item.name;
        } else {
            text += value[ii];
        }
    }
    let contentState = ContentState.createFromText(text);
    const contentBlock = contentState.getFirstBlock();
    pendingEntities.forEach(([start, end, item]) => {
        contentState = contentState.createEntity('mention', 'SEGMENTED', item);
        const entityKey = contentState.getLastCreatedEntityKey();

        let selectionState = SelectionState.createEmpty(contentBlock.getKey());
        selectionState = selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
            hasFocus: true,
        });

        contentState = Modifier.applyEntity(contentState, selectionState, entityKey);
    });
    return convertToRaw(contentState);
}

function updateDraftContent(value, oldItems, newItems) {
    let contentState = convertFromRaw(value);

    const mapping = {};
    newItems.forEach((newItem, index) => {
        const key = oldItems ? oldItems[index].id : newItem.id;
        mapping[key] = newItem;
    });

    const pendingEntities = [];

    let currentEntityKey;
    let currentEntity;
    contentState.getFirstBlock().findEntityRanges((charMetadata) => {
        currentEntityKey = charMetadata.getEntity();
        if (currentEntityKey) {
            currentEntity = contentState.getEntity(currentEntityKey);
            return true;
        }
        return false;
    }, (start, end) => {
        const itemId = currentEntity.getData()[PLUGIN_NAME].id;
        const item = mapping[itemId];
        pendingEntities.push([start, end, currentEntityKey, item]);
    });

    const blockKey = contentState.getFirstBlock().getKey();
    pendingEntities.reverse().forEach(([start, end, entityKey, item]) => {
        let selectionState = SelectionState.createEmpty(blockKey);
        selectionState = selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
            hasFocus: true,
        });
        contentState = Modifier.replaceText(
            contentState,
            selectionState,
            item.name,
            null,
            entityKey,
        ).replaceEntityData(
            entityKey,
            { [PLUGIN_NAME]: item },
        );
    });

    return convertToRaw(contentState);
}

function substituteValuesIntoDraftContent(value, logValues) {
    const contentState = convertFromRaw(value);
    const contentBlock = contentState.getFirstBlock();
    const text = contentBlock.getText();

    const mapping = {};
    logValues.forEach((logValue) => {
        mapping[logValue.logKey.id] = logValue.data || '???';
    });

    let previous = 0;
    let currentEntity;
    let result = '';
    contentBlock.findEntityRanges((charMetadata) => {
        const entityKey = charMetadata.getEntity();
        if (entityKey) {
            currentEntity = contentState.getEntity(entityKey);
            return true;
        }
        return false;
    }, (start, end) => {
        result += text.substring(previous, start);
        const itemId = currentEntity.getData()[PLUGIN_NAME].id;
        result += mapping[itemId];
        previous = end;
    });
    result += text.substring(previous, text.length);

    return Array.from(result.matchAll(/(?:\{[^}]*\}|[^{}]*)/g))
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
}

export {
    extractLogTags,
    convertDraftContentToPlainText,
    convertPlainTextToDraftContent,
    updateDraftContent,
    substituteValuesIntoDraftContent,
};
