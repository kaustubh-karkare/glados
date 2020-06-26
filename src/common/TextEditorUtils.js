
import {
    ContentState, EditorState, convertFromRaw, convertToRaw,
} from 'draft-js';

import assert from './assert';

const StorageType = {
    PLAINTEXT: 'plaintext:',
    DRAFTJS: 'draftjs:',
};

function toString(value) {
    if (typeof value === 'undefined') {
        return 'undefined';
    }
    return JSON.stringify(value, null, 4);
}

class TextEditorUtils {
    // eslint-disable-next-line consistent-return
    static extractPlainText(value) {
        if (!value) {
            return '';
        } if (value.startsWith(StorageType.PLAINTEXT)) {
            return value.substring(StorageType.PLAINTEXT.length);
        } if (value.startsWith(StorageType.DRAFTJS)) {
            const payload = value.substring(StorageType.DRAFTJS.length);
            const content = JSON.parse(payload);
            // assert(content.blocks.length === 1);
            return content.blocks[0].text;
        }
        assert(false, value);
    }

    // eslint-disable-next-line consistent-return
    static deserialize(value, type) {
        if (!value) {
            if (type === StorageType.PLAINTEXT) {
                return '';
            } if (type === StorageType.DRAFTJS) {
                return convertToRaw(EditorState.createEmpty().getCurrentContent());
            }
        } if (value.startsWith(StorageType.PLAINTEXT)) {
            const payload = value.substring(StorageType.PLAINTEXT.length);
            if (type === StorageType.PLAINTEXT) {
                return payload;
            } if (type === StorageType.DRAFTJS) {
                const editorState = EditorState.createWithContent(
                    ContentState.createFromText(payload),
                );
                return convertToRaw(editorState.getCurrentContent());
            }
        } else if (value.startsWith(StorageType.DRAFTJS)) {
            const payload = value.substring(StorageType.DRAFTJS.length);
            if (type === StorageType.PLAINTEXT) {
                assert(false, `Cannot deserialize draftjs to plaintext: ${toString(payload)}`);
            } else if (type === StorageType.DRAFTJS) {
                return JSON.parse(payload);
            }
        }
        assert(false, `Invalid deserialize type: ${toString(type)} for ${toString(value)}`);
    }

    // eslint-disable-next-line consistent-return
    static serialize(value, type) {
        if (!value) {
            return '';
        } if (type === StorageType.PLAINTEXT) {
            if (typeof value === 'string') {
                return StorageType.PLAINTEXT + value;
            } if (typeof value === 'object') {
                assert(false, `Cannot serialize draftjs to plaintext: ${toString(value)}`);
            }
            assert(false, value);
        } else if (type === StorageType.DRAFTJS) {
            if (typeof value === 'string') {
                assert(false, `Cannot serialize plaintext to draftjs: ${toString(value)}`);
            } else if (typeof value === 'object') {
                if (value.blocks.length > 1 || value.blocks[0].text.length > 0) {
                    return StorageType.DRAFTJS + JSON.stringify(value);
                }
                return '';
            }
            assert(false, value);
        }
        assert(false, `Invalid serialize type: ${toString(type)}`);
    }

    static fromEditorState(editorState) {
        return convertToRaw(editorState.getCurrentContent());
    }

    static toEditorState(value) {
        const editorState = EditorState.createWithContent(convertFromRaw(value));
        return EditorState.moveSelectionToEnd(editorState);
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
            return EditorState.forceSelection(nextEditorState, fixedSelection);
        }
        return nextEditorState;
    }
}

TextEditorUtils.StorageType = StorageType;

export default TextEditorUtils;
