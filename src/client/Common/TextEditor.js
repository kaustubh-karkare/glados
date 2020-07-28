
import classNames from 'classnames';
import Editor from 'draft-js-plugins-editor';
import { RichUtils } from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';

import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';

import TextEditorUtils from '../../common/TextEditorUtils';
import { KeyCodes } from './Utils';
import AddLinkPlugin from './AddLinkPlugin';
import Coordinator from './Coordinator';

import 'draft-js/dist/Draft.css';
import './TextEditor.css';

function MentionComponent(props) {
    const item = props.mention;
    return (
        <a
            className="topic"
            title={item.name}
            href="#"
            onClick={() => Coordinator.invoke('details', item)}
        >
            {props.children}
        </a>
    );
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
        const oldContent = TextEditorUtils.deserialize(
            state.value,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        const newContent = TextEditorUtils.deserialize(
            props.value,
            TextEditorUtils.StorageType.DRAFTJS,
        );
        if (isFirstTime || !TextEditorUtils.equals(oldContent, newContent)) {
            state.value = props.value;
            // The new value is not what we expected. Reset editor state.
            // eslint-disable-next-line no-param-reassign
            state.editorState = TextEditorUtils.toEditorState(newContent);
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
        });
        this.state.plugins.push(this.mentionPlugin);

        this.textEditorRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.focusOnLoad && this.textEditorRef.current) {
            // https://github.com/draft-js-plugins/draft-js-plugins/issues/800
            window.setTimeout(this.textEditorRef.current.focus, 0);
        }
    }

    onSearchChange({ value: query }) {
        window.api.send('typeahead', { query, dataTypes: this.props.serverSideTypes })
            .then((serverSideOptions) => {
                const options = [...serverSideOptions, ...this.props.clientSideOptions];
                this.setState(
                    { suggestions: defaultSuggestionsFilter(query, options) },
                    () => this.mentionPlugin.onChange(this.state.editorState),
                );
            });
    }

    onAddMention(option) {
        if (this.props.onSelectSuggestion) {
            this.props.onSelectSuggestion(option);
        }
    }

    onChange(editorState) {
        editorState = TextEditorUtils.fixCursorBug(this.state.editorState, editorState);
        this.setState({ editorState });
        const oldValue = this.props.value;
        const newValue = TextEditorUtils.serialize(
            TextEditorUtils.fromEditorState(editorState),
            TextEditorUtils.StorageType.DRAFTJS,
        );
        if (oldValue !== newValue && this.props.onChange) {
            this.setState(
                { onChange: true, value: newValue },
                () => this.props.onChange(newValue),
            );
        }
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
                    ref={this.textEditorRef}
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

    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,

    focusOnLoad: PropTypes.bool,
    isSingleLine: PropTypes.bool,
    onSpecialKeys: PropTypes.func,

    clientSideOptions: PropTypes.arrayOf(
        PropTypes.shape({
            __type__: PropTypes.string.isRequired,
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        }).isRequired,
    ),
    serverSideTypes: PropTypes.arrayOf(
        PropTypes.string.isRequired,
    ),
    onSelectSuggestion: PropTypes.func,
};

TextEditor.defaultProps = {
    unstyled: false,
    disabled: false,
    isSingleLine: false,
    clientSideOptions: [],
    serverSideTypes: [],
};

export default TextEditor;
