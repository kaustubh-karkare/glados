
import {
    ContentState, SelectionState, Modifier, convertToRaw,
} from 'draft-js';

const PLUGIN_NAME = 'mention';
const ENTITY_TYPE = 'mention';

function extractLogTopics(content) {
    // There's no way to extract the list of entity-keys from the contentState API.
    // And so I'm just accessing the raw data here.
    content = convertToRaw(content);
    const logTopics = {};
    Object.values(content.entityMap)
        .filter((entity) => entity.type === ENTITY_TYPE)
        .forEach((entity) => {
            const logTopic = entity.data[PLUGIN_NAME];
            if (logTopic.__type__ === 'log-topic') {
                logTopics[logTopic.id] = logTopic;
            }
        });
    return logTopics;
}

function convertDraftContentToPlainText(contentState, symbolToItems) {
    const contentBlock = contentState.getFirstBlock();
    const text = contentBlock.getText();

    const symbolToMapping = {};
    Object.entries(symbolToItems).forEach(([symbol, items]) => {
        const mapping = {};
        items.forEach((item, index) => {
            if (item) {
                mapping[item.id] = index;
            }
        });
        symbolToMapping[symbol] = mapping;
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
        const item = currentEntity.getData()[PLUGIN_NAME];
        const index = symbolToMapping[item.symbol][item.id];
        result += item.symbol + index;
        previous = end;
    });
    result += text.substring(previous, text.length);
    return result;
}

function convertPlainTextToDraftContent(value, symbolToItems) {
    let text = '';
    const pendingEntities = [];
    for (let ii = 0; ii < value.length; ii += 1) {
        if (value[ii] in symbolToItems) {
            const symbol = value[ii];
            ii += 1;
            // Assumption: Single digit.
            const index = parseInt(value[ii], 10);
            const items = symbolToItems[symbol];
            const item = { ...items[index], symbol };
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
        contentState = contentState.createEntity(ENTITY_TYPE, 'SEGMENTED', item);
        const entityKey = contentState.getLastCreatedEntityKey();

        let selectionState = SelectionState.createEmpty(contentBlock.getKey());
        selectionState = selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
            hasFocus: true,
        });

        contentState = Modifier.applyEntity(contentState, selectionState, entityKey);
    });
    return contentState;
}

function updateDraftContent(contentState, oldItems, newItems) {
    const keyToIndex = {};
    oldItems.forEach((oldItem, index) => {
        const key = `${oldItem.type}:${oldItem.id}`;
        keyToIndex[key] = index;
    });

    const pendingEntities = [];

    contentState.getBlocksAsArray().forEach((contentBlock) => {
        const currentBlockKey = contentBlock.getKey();
        let currentEntityKey;
        let currentEntity;
        contentBlock.findEntityRanges((charMetadata) => {
            currentEntityKey = charMetadata.getEntity();
            if (currentEntityKey) {
                currentEntity = contentState.getEntity(currentEntityKey);
                return currentEntity.getType() === ENTITY_TYPE;
            }
            return false;
        }, (start, end) => {
            const prevItem = currentEntity.getData()[PLUGIN_NAME];
            const key = `${prevItem.type}:${prevItem.id}`;
            if (key in keyToIndex) {
                let nextItem = newItems[keyToIndex[key]];
                if (typeof nextItem === 'object') {
                    if (
                        prevItem.id === nextItem.id
                        && prevItem.name === nextItem.name
                    ) {
                        return; // no change
                    }
                    // The symbol is forwarded only for testing!
                    nextItem = { ...nextItem, symbol: prevItem.symbol };
                }
                pendingEntities.push([currentBlockKey, start, end, currentEntityKey, nextItem]);
            }
        });
    });

    pendingEntities.reverse().forEach(([blockKey, start, end, entityKey, item]) => {
        let selectionState = SelectionState.createEmpty(blockKey);
        selectionState = selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
            hasFocus: true,
        });
        if (typeof item === 'object') {
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
        } else {
            // item is a string
            contentState = Modifier.replaceText(
                contentState,
                selectionState,
                item,
                null,
                null,
            );
        }
    });

    return contentState;
}

function evaluateDraftContentExpressions(contentState) {
    const pendingExpressions = [];

    contentState.getBlocksAsArray().forEach((contentBlock) => {
        const currentBlockKey = contentBlock.getKey();
        let start = 0;
        Array.from(contentBlock.getText().matchAll(/(?:\{[^}]*\}|[^{}]*)/g))
            .forEach(([part]) => {
                if (part.startsWith('{') && part.endsWith('}')) {
                    try {
                        // eslint-disable-next-line no-eval
                        const result = eval(part.substring(1, part.length - 1)).toString();
                        pendingExpressions.push([
                            currentBlockKey,
                            start,
                            start + part.length,
                            result,
                        ]);
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.info(error);
                    }
                }
                start += part.length;
            });
    });

    pendingExpressions.reverse().forEach(([blockKey, start, end, result]) => {
        let selectionState = SelectionState.createEmpty(blockKey);
        selectionState = selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
            hasFocus: true,
        });
        contentState = Modifier.replaceText(
            contentState,
            selectionState,
            result,
            null,
            null,
        );
    });

    return contentState;
}

export {
    extractLogTopics,
    convertDraftContentToPlainText,
    convertPlainTextToDraftContent,
    updateDraftContent,
    evaluateDraftContentExpressions,
};
