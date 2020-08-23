
import {
    ContentState, EditorState, Modifier, SelectionState, convertFromRaw, convertToRaw,
} from 'draft-js';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';

import assert from 'assert';

const StorageType = {
    MARKDOWN: 'markdown:',
    DRAFTJS: 'draftjs:',
};

function toString(value) {
    if (typeof value === 'undefined') {
        return 'undefined';
    }
    return JSON.stringify(value, null, 4);
}

const deserializeCache = {};

const DRAFTJS_MENTION_PLUGIN_NAME = 'mention';
const DRAFTJS_MENTION_ENTITY_TYPE = 'mention';
const MARKDOWN_MENTION_PREFIX = 'mention';

const LINK_ENTITY_TYPE = 'LINK';

const draftToMarkdownOptions = {
    entityItems: {
        mention: {
            open(entity) {
                return '[';
            },
            close(entity) {
                return `](${MARKDOWN_MENTION_PREFIX}:${entity.data.mention.__type__}:${entity.data.mention.id})`;
            },
        },
    },
};

function postProcessDraftRawContent(rawContent) {
    Object.values(rawContent.entityMap).forEach((entity) => {
        if (entity.type === 'LINK') {
            delete entity.data.href;
            if (entity.data.url.startsWith(MARKDOWN_MENTION_PREFIX)) {
                const parts = entity.data.url.split(':');
                entity.type = 'mention';
                entity.mutability = 'SEGMENTED';
                entity.data = {
                    mention: { __type__: parts[1], id: parseInt(parts[2], 10) },
                };
            }
        }
    });
}

class TextEditorUtils {
    // eslint-disable-next-line consistent-return
    static extractPlainText(value) {
        const content = TextEditorUtils.deserialize(value, StorageType.DRAFTJS);
        const blocks = content.getBlocksAsArray();
        assert(blocks.length === 1);
        return blocks[0].getText();
    }

    static equals(left, right) {
        if (left === right) return true;
        const leftRaw = convertToRaw(left);
        const rightRaw = convertToRaw(right);
        const replaceKey = (block) => { delete block.key; delete block.data.language; };
        leftRaw.blocks.forEach(replaceKey);
        rightRaw.blocks.forEach(replaceKey);
        return JSON.stringify(leftRaw) === JSON.stringify(rightRaw);
    }

    static _deserializeToDraftContent(payload) {
        if (!(payload in deserializeCache)) {
            const editorState = EditorState.createWithContent(
                ContentState.createFromText(payload),
            );
            deserializeCache[payload] = editorState.getCurrentContent();
        }
        return deserializeCache[payload];
    }

    // eslint-disable-next-line consistent-return
    static deserialize(value, type) {
        if (!value) {
            if (type === StorageType.MARKDOWN) {
                return '';
            } if (type === StorageType.DRAFTJS) {
                return TextEditorUtils._deserializeToDraftContent('');
            }
        } else if (value.startsWith(StorageType.MARKDOWN)) {
            const payload = value.substring(StorageType.MARKDOWN.length);
            if (type === StorageType.MARKDOWN) {
                return payload;
            } if (type === StorageType.DRAFTJS) {
                const rawContent = markdownToDraft(value);
                postProcessDraftRawContent(rawContent);
                return convertFromRaw(rawContent);
            }
        } else if (value.startsWith(StorageType.DRAFTJS)) {
            const payload = value.substring(StorageType.DRAFTJS.length);
            if (type === StorageType.MARKDOWN) {
                return draftToMarkdown(JSON.parse(payload), draftToMarkdownOptions);
            } if (type === StorageType.DRAFTJS) {
                return convertFromRaw(JSON.parse(payload));
            }
        }
        assert(false, `Invalid deserialize type: ${toString(type)} for ${toString(value)}`);
    }

    // eslint-disable-next-line consistent-return
    static serialize(value, type) {
        if (!value) {
            return '';
        } if (type === StorageType.MARKDOWN) {
            if (typeof value === 'object') {
                value = draftToMarkdown(convertToRaw(value), draftToMarkdownOptions);
            }
            return StorageType.MARKDOWN + value;
        } if (type === StorageType.DRAFTJS) {
            if (typeof value === 'string') {
                const rawContent = markdownToDraft(value);
                postProcessDraftRawContent(rawContent);
                value = convertFromRaw(rawContent);
            }
            if (value.hasText()) {
                return StorageType.DRAFTJS + JSON.stringify(convertToRaw(value));
            }
            return '';
        }
        assert(false, `Invalid serialize type: ${toString(type)}`);
    }

    static fromEditorState(editorState) {
        return editorState.getCurrentContent();
    }

    static toEditorState(value) {
        const editorState = EditorState.createWithContent(value);
        return EditorState.moveSelectionToEnd(editorState);
    }

    static getSelectionData(editorState) {
        const selectionState = editorState.getSelection();
        const blocks = editorState.getCurrentContent().getBlocksAsArray();
        let anchorIndex = null; let
            focusIndex = null;
        blocks.forEach((block, index) => {
            if (block.getKey() === selectionState.getAnchorKey()) {
                anchorIndex = index;
            }
            if (block.getKey() === selectionState.getFocusKey()) {
                focusIndex = index;
            }
        });
        return {
            anchorIndex,
            anchorOffset: selectionState.getAnchorOffset(),
            focusIndex,
            focusOffset: selectionState.getFocusOffset(),
            hasFocus: selectionState.hasFocus,
        };
    }

    static setSelectionData(editorState, data) {
        const blocks = editorState.getCurrentContent().getBlocksAsArray();
        const anchorKey = blocks[data.anchorIndex].getKey();
        const focusKey = blocks[data.focusIndex].getKey();
        let selectionState = SelectionState.createEmpty();
        selectionState = selectionState.merge({
            anchorKey,
            anchorOffset: data.anchorOffset,
            focusKey,
            focusOffset: data.focusOffset,
            hasFocus: data.hasFocus,
        });
        return EditorState.acceptSelection(editorState, selectionState);
    }

    static fixCursorBug(prevEditorState, nextEditorState) {
        // https://github.com/facebook/draft-js/issues/1198
        const prevSelection = prevEditorState.getSelection();
        const nextSelection = nextEditorState.getSelection();
        if (
            prevSelection.getAnchorKey() === nextSelection.getAnchorKey()
            && prevSelection.getAnchorOffset() === 0
            && nextSelection.getAnchorOffset() === 1
            && prevSelection.getFocusKey() === nextSelection.getFocusKey()
            && prevSelection.getFocusOffset() === 0
            && nextSelection.getFocusOffset() === 1
            && prevSelection.getHasFocus() === false
            && nextSelection.getHasFocus() === false
        ) {
            const fixedSelection = nextSelection.merge({ hasFocus: true });
            return EditorState.acceptSelection(nextEditorState, fixedSelection);
        }
        return nextEditorState;
    }

    static convertPlainTextToDraftContent(value, symbolToItems) {
        if (!value) {
            return value || '';
        }
        let markdown = '';
        for (let ii = 0; ii < value.length; ii += 1) {
            if (value[ii] in symbolToItems) {
                const symbol = value[ii];
                ii += 1;
                const index = parseInt(value[ii], 10);
                const item = symbolToItems[symbol][index];
                markdown += `[${item.name}](mention:${item.__type__}:${item.id})`;
            } else {
                markdown += value[ii];
            }
        }
        return TextEditorUtils.serialize(
            markdown,
            StorageType.DRAFTJS,
        );
    }


    static convertDraftContentToPlainText(value, symbolToItems) {
        const markdown = TextEditorUtils.deserialize(
            value,
            StorageType.MARKDOWN,
        );

        const mapping = {};
        Object.entries(symbolToItems).forEach(([symbol, items]) => {
            items.forEach((item, index) => {
                if (item) {
                    const key = `${item.__type__}:${item.id}`;
                    if (!(key in mapping)) {
                        mapping[key] = symbol + index;
                    }
                }
            });
        });

        const regex1 = new RegExp(`(?:\\[.*?\\]\\(${MARKDOWN_MENTION_PREFIX}:.*?\\)|[^\\[]*)`, 'g');
        const regex2 = new RegExp(`^\\[(.*?)\\]\\(${MARKDOWN_MENTION_PREFIX}:(.*?)\\)$`);
        return Array.from(markdown.matchAll(regex1))
            .map(([part]) => {
                const result = part.match(regex2);
                if (result) {
                    return mapping[result[2]];
                }
                return part;
            })
            .join('');
    }

    static extractMentions(content, type) {
        // There's no way to extract the list of entity-keys from the contentState API.
        // And so I'm just accessing the raw data here.
        content = convertToRaw(content);
        const result = {};
        Object.values(content.entityMap)
            .filter((entity) => entity.type === DRAFTJS_MENTION_ENTITY_TYPE)
            .forEach((entity) => {
                const item = entity.data[DRAFTJS_MENTION_PLUGIN_NAME];
                if (item.__type__ === type) {
                    result[item.id] = item;
                }
            });
        return result;
    }

    static updateDraftContent(contentState, oldItems, newItems) {
        const keyToIndex = {};
        oldItems.forEach((oldItem, index) => {
            const key = `${oldItem.__type__}:${oldItem.id}`;
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
                    return currentEntity.getType() === DRAFTJS_MENTION_ENTITY_TYPE;
                }
                return false;
            }, (start, end) => {
                const prevItem = currentEntity.getData()[DRAFTJS_MENTION_PLUGIN_NAME];
                const key = `${prevItem.__type__}:${prevItem.id}`;
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
                    { [DRAFTJS_MENTION_PLUGIN_NAME]: item },
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

    static addPrefixToDraftContent(contentState, items) {
        const blocks = contentState.getBlocksAsArray();
        assert(blocks.length === 1);
        let selectionState = SelectionState.createEmpty(blocks[0].getKey());
        selectionState = selectionState.merge({
            anchorOffset: 0,
            focusOffset: 0,
            hasFocus: true,
        });
        items.forEach((item) => {
            let delta;
            if (typeof item === 'string') {
                contentState = Modifier.insertText(
                    contentState,
                    selectionState,
                    item,
                    null,
                    null,
                );
                delta += item.length;
            } else {
                contentState = contentState.createEntity(
                    DRAFTJS_MENTION_ENTITY_TYPE,
                    'SEGMENTED',
                    { [DRAFTJS_MENTION_PLUGIN_NAME]: item },
                );
                contentState = Modifier.insertText(
                    contentState,
                    selectionState,
                    item.name,
                    null,
                    contentState.getLastCreatedEntityKey(),
                );
                delta += item.name.length;
            }
            selectionState = selectionState.merge({
                anchorOffset: selectionState.anchorOffset + delta,
                focusOffset: selectionState.focusOffset + delta,
            });
        });
        return contentState;
    }

    static evaluateDraftContentExpressions(contentState) {
        const pendingUpdates = [];

        contentState.getBlocksAsArray().forEach((contentBlock) => {
            const currentBlockKey = contentBlock.getKey();
            const currentBlockText = contentBlock.getText();
            for (let startIndex = 0, endIndex = -1; startIndex < currentBlockText.length;) {
                const originalStartIndex = startIndex;
                if (currentBlockText[startIndex] === '{') {
                    endIndex = currentBlockText.indexOf('}', startIndex);
                    assert(endIndex !== -1);
                    const expression = currentBlockText.substring(startIndex + 1, endIndex);
                    startIndex = endIndex + 1;
                    try {
                        // eslint-disable-next-line no-eval
                        const result = eval(expression).toString();
                        pendingUpdates.push({
                            blockKey: currentBlockKey,
                            startIndex: originalStartIndex,
                            endIndex: startIndex,
                            text: result,
                        });
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error(error);
                    }
                } else if (currentBlockText[startIndex] === '[') {
                    endIndex = currentBlockText.indexOf(']', startIndex);
                    assert(endIndex !== -1);
                    const linkText = currentBlockText.substring(startIndex + 1, endIndex);
                    startIndex = endIndex + 1;
                    assert(currentBlockText[startIndex] === '(');
                    endIndex = currentBlockText.indexOf(')', startIndex);
                    assert(endIndex !== -1);
                    const linkHref = currentBlockText.substring(startIndex + 1, endIndex);
                    startIndex = endIndex + 1;

                    contentState = contentState.createEntity(
                        LINK_ENTITY_TYPE,
                        'IMMUTABLE',
                        { url: linkHref },
                    );
                    pendingUpdates.push({
                        blockKey: currentBlockKey,
                        startIndex: originalStartIndex,
                        endIndex: startIndex,
                        text: linkText,
                        entityKey: contentState.getLastCreatedEntityKey(),
                    });
                } else {
                    startIndex += 1;
                }
            }
        });

        pendingUpdates.reverse().forEach(({
            blockKey, startIndex, endIndex, text, entityKey,
        }) => {
            let selectionState = SelectionState.createEmpty(blockKey);
            selectionState = selectionState.merge({
                anchorOffset: startIndex,
                focusOffset: endIndex,
                hasFocus: true,
            });
            contentState = Modifier.replaceText(
                contentState,
                selectionState,
                text,
                null,
                entityKey || null,
            );
        });

        return contentState;
    }
}

TextEditorUtils.StorageType = StorageType;

export default TextEditorUtils;
