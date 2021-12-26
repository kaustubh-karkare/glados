import assert from 'assert';
import classNames from 'classnames';
import Editor from 'draft-js-plugins-editor';
import { RichUtils } from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';

import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
import createMentionPlugin from 'draft-js-mention-plugin';

import TextEditorUtils from '../../common/TextEditorUtils';
import { KeyCodes } from './Utils';
import AddLinkPlugin from './AddLinkPlugin';
import Link from './Link';
import TypeaheadOptions from './TypeaheadOptions';

import 'draft-js/dist/Draft.css';
import './TextEditor.css';

function MentionComponent(props) {
    return <Link logTopic={props.mention}>{props.children}</Link>;
}

MentionComponent.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    mention: PropTypes.any.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

function OptionComponent(props) {
    const {
        isFocused: _isFocused, // eslint-disable-line react/prop-types
        mention: item,
        searchValue: _searchValue, // eslint-disable-line react/prop-types
        theme: _theme, // eslint-disable-line react/prop-types
        ...moreProps
    } = props;
    return <div {...moreProps}>{item.name}</div>;
}

OptionComponent.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    mention: PropTypes.any.isRequired,
};

class TextEditor extends React.Component {
    static getDerivedStateFromProps(props, state) {
        if (state.onChange) {
            // This component is being updated because onChange is about to be called,
            // and we want to remember the expected new value.
            delete state.onChange;
            return state;
        }
        const isFirstTime = !('value' in state);
        // WARNING: Even if props.value is equivalent to state.value, they might
        // not be in the same format, and that could lead to an infinite loop!
        if (isFirstTime || !TextEditorUtils.equals(state.value, props.value)) {
            state.value = props.value;
            // The new value is not what we expected. Reset editor state.
            // eslint-disable-next-line no-param-reassign
            state.editorState = TextEditorUtils.toEditorState(props.value);
        }
        return state;
    }

    constructor(props) {
        super(props);
        this.state = {
            suggestions: [],
            open: false,
            plugins: [],
        };

        this.state.plugins.push(AddLinkPlugin);

        if (!this.props.isSingleLine) {
            this.markdownShortcutsPlugin = createMarkdownShortcutsPlugin();
            this.state.plugins.push(this.markdownShortcutsPlugin);
        }

        this.mentionPlugin = createMentionPlugin({
            mentionComponent: MentionComponent,
            supportWhitespace: true,
        });
        this.state.plugins.push(this.mentionPlugin);

        this.ref = React.createRef();
    }

    handleKeyCommand(command, editorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        if (this.props.isSingleLine && command === 'split-block') {
            return 'handled';
        }
        return 'not-handled';
    }

    onSearchChange({ value: query }) {
        this.props.options
            .search(query)
            .then((suggestions) => this.setState(
                { suggestions },
                () => this.mentionPlugin.onChange(this.state.editorState),
            ));
    }

    onAddMention(option) {
        this.props.options
            .select(option)
            .then((result) => {
                if (typeof result === 'undefined') return;
                const selection = TextEditorUtils.getSelectionData(this.state.editorState);
                // Abstraction leak! Do not assume name.
                const delta = result.name.length - option.name.length;
                selection.anchorOffset += delta;
                selection.focusOffset += delta;
                let content = TextEditorUtils.fromEditorState(this.state.editorState);
                content = TextEditorUtils.updateDraftContent(content, [option], [result || '']);
                let editorState = TextEditorUtils.toEditorState(content);
                // TODO: Figure out why the cursor is not updated properly.
                editorState = TextEditorUtils.setSelectionData(editorState, selection);
                this.onChange(editorState);
            });
    }

    onChange(editorState) {
        editorState = TextEditorUtils.fixCursorBug(this.state.editorState, editorState);
        this.setState({ editorState });
        const newValue = TextEditorUtils.fromEditorState(editorState);
        if (this.props.onChange) {
            this.setState(
                { onChange: true, value: newValue },
                () => this.props.onChange(newValue),
            );
        }
    }

    focus() {
        // Why the delay?
        // This broke something inside the DraftJS Editor
        // that caused mentions to not be rendered properly.
        window.setTimeout(this.ref.current.focus, 0);
    }

    keyBindingFn(event) {
        if (
            this.props.isSingleLine
            && [KeyCodes.ESCAPE, KeyCodes.ENTER].includes(event.keyCode)
            && this.props.onSpecialKeys
        ) {
            this.props.onSpecialKeys(event);
        }
        // https://github.com/draft-js-plugins/draft-js-plugins/issues/1117
        // Do not invoke getDefaultKeyBinding here!
    }

    renderSuggestions() {
        const { MentionSuggestions } = this.mentionPlugin;
        return (
            <div className="mention-suggestions">
                <MentionSuggestions
                    open={this.state.open}
                    onSearchChange={(data) => this.onSearchChange(data)}
                    onAddMention={(option) => this.onAddMention(option)}
                    suggestions={this.state.suggestions}
                    entryComponent={OptionComponent}
                />
            </div>
        );
    }

    render() {
        return (
            <div className={classNames({
                'text-editor': true,
                unstyled: this.props.unstyled,
                styled: !this.props.unstyled,
                disabled: this.props.disabled,
                isSingleLine: this.props.isSingleLine,
                'min-width': this.props.minWidth,
            })}
            >
                <Editor
                    readOnly={this.props.disabled}
                    editorState={this.state.editorState}
                    keyBindingFn={(event) => this.keyBindingFn(event)}
                    handleKeyCommand={
                        (command, editorState) => this.handleKeyCommand(command, editorState)
                    }
                    plugins={this.state.plugins}
                    onChange={(editorState) => this.onChange(editorState)}
                    placeholder={this.props.placeholder}
                    ref={this.ref}
                />
                {this.props.disabled ? null : this.renderSuggestions()}
            </div>
        );
    }
}

TextEditor.propTypes = {
    unstyled: PropTypes.bool,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    minWidth: PropTypes.bool,

    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object,
    onChange: PropTypes.func,

    isSingleLine: PropTypes.bool,
    onSpecialKeys: PropTypes.func,

    options: PropTypes.instanceOf(TypeaheadOptions),
};

TextEditor.defaultProps = {
    unstyled: false,
    disabled: false,
    isSingleLine: false,
    minWidth: false,
};

/**
 * The primary component generates an inline block that does not look great on
 * the main page. This alternative implementation generates an inline span.
 */
TextEditor.SimpleViewer = (props) => {
    if (!props.value) {
        return null;
    }
    const rawContent = props.value;
    assert(rawContent.blocks.length === 1);
    const { text } = rawContent.blocks[0];
    let textIndex = 0;
    const entityRanges = Object.values(rawContent.blocks[0].entityRanges);
    let entityRangeIndex = 0;
    const parts = [];
    while (textIndex < text.length) {
        const entityRange = entityRanges[entityRangeIndex];
        let part;
        if (entityRange && entityRange.offset === textIndex) {
            const key = `entity-${entityRangeIndex}`;
            entityRangeIndex += 1;
            const entity = rawContent.entityMap[entityRange.key];
            const endIndex = textIndex + entityRange.length;
            const textPart = text.slice(textIndex, endIndex);
            textIndex = endIndex;
            if (entity.type === 'mention') {
                part = (
                    <Link key={key} logTopic={entity.data.mention}>
                        {textPart}
                    </Link>
                );
            } else if (entity.type === 'LINK') {
                part = (
                    <a key={key} href={entity.data.url} target="_blank" rel="noopener noreferrer">
                        {textPart}
                    </a>
                );
            }
        } else {
            const endIndex = entityRange ? entityRange.offset : text.length;
            const textPart = text.slice(textIndex, endIndex);
            textIndex = endIndex;
            part = textPart;
        }
        assert(part);
        parts.push(part);
    }
    return <span>{parts}</span>;
};

TextEditor.SimpleViewer.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
};

export default TextEditor;
