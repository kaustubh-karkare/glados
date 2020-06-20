
import Editor from 'draft-js-plugins-editor';
import {
    EditorState, RichUtils, convertFromRaw, convertToRaw,
} from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';

// Using a local copy of the plugin until the PR is merged.
// https://github.com/draft-js-plugins/draft-js-plugins/pull/1419
// cp -r ../draft-js-plugins/draft-js-mention-plugin src/client/Common
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
import createSingleLinePlugin from 'textio-draft-js-single-line-plugin';
import createMentionPlugin, { defaultSuggestionsFilter } from './draft-js-mention-plugin/src';

import assert from '../../common/assert';

import 'draft-js/dist/Draft.css';

const SerializationUtils = {
    deserialize(text) {
        if (!text) {
            return convertToRaw(EditorState.createEmpty().getCurrentContent());
        }
        return JSON.parse(text);
    },
    serialize(rawContent, isEmpty) {
        if (isEmpty) {
            return '';
        }
        return JSON.stringify(rawContent);
    },
};

class TextEditor extends React.Component {
    static getDerivedStateFromProps(props, state) {
        // eslint-disable-next-line no-param-reassign
        state.rawContent = SerializationUtils.deserialize(props.value);
        if (!state.editorState) { // first time only
            // eslint-disable-next-line no-param-reassign
            state.editorState = EditorState.createWithContent(convertFromRaw(state.rawContent));
        }
        return state;
    }

    constructor(props) {
        super(props);
        this.state = {
            suggestions: [], // [{name, link, avatar}]
            open: false,
            plugins: [],
        };

        if (this.props.isMarkdown) {
            this.markdownShortcutsPlugin = createMarkdownShortcutsPlugin();
            this.state.plugins.push(this.markdownShortcutsPlugin);
        }

        this.mentionPlugin = createMentionPlugin({
            mentionTriggers: this.props.sources.map((suggestion) => suggestion.trigger),
        });
        this.state.plugins.push(this.mentionPlugin);

        if (this.props.isSingleLine) {
            this.singleLinePlugin = createSingleLinePlugin({
                stripEntities: false,
            });
            this.state.plugins.push(this.singleLinePlugin);
        }
    }

    onSearchChange({ trigger, value }) {
        const selectedSource = this.props.sources
            .find((suggestion) => suggestion.trigger === trigger);
        assert(selectedSource, 'unknown suggestion for trigger');
        if (selectedSource.options) {
            this.setState({
                suggestions: defaultSuggestionsFilter(value, selectedSource.options),
            });
        } else if (selectedSource.rpcName) {
            window.api.send(selectedSource.rpcName, { trigger, value })
                .then((options) => this.setState({
                    suggestions: defaultSuggestionsFilter(value, options),
                }));
        } else {
            assert(false, 'missing source');
        }
    }

    onChange(editorState) {
        this.setState({ editorState });
        const rawContent = convertToRaw(editorState.getCurrentContent());
        const isEmpty = !editorState.getCurrentContent().hasText();
        if (
            SerializationUtils.serialize(this.state.rawContent)
                === SerializationUtils.serialize(rawContent)
        ) {
            return;
        }
        const value = SerializationUtils.serialize(rawContent, isEmpty);
        this.props.onUpdate(value);
    }

    handleKeyCommand(command, editorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    render() {
        const { MentionSuggestions } = this.mentionPlugin;
        return (
            <div className="text-editor">
                <Editor
                    editorState={this.state.editorState}
                    handleKeyCommand={
                        (command, editorState) => this.handleKeyCommand(command, editorState)
                    }
                    blockRenderMap={
                        this.props.isSingleLine
                            ? this.singleLinePlugin.blockRenderMap
                            : undefined
                    }
                    plugins={this.state.plugins}
                    onChange={(editorState) => this.onChange(editorState)}
                />
                <div className="mention-suggestions">
                    <MentionSuggestions
                        open={this.state.open}
                        onOpenChange={(open) => this.setState({ open })}
                        onSearchChange={(data) => this.onSearchChange(data)}
                        suggestions={this.state.suggestions}
                    />
                </div>
            </div>
        );
    }
}

TextEditor.propTypes = {
    value: PropTypes.string.isRequired,
    isMarkdown: PropTypes.bool,
    isSingleLine: PropTypes.bool,
    sources: PropTypes.arrayOf(
        PropTypes.shape({
            trigger: PropTypes.string.isRequired,
            options: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
            }).isRequired),
            rpcName: PropTypes.string,
        }).isRequired,
    ),
    onUpdate: PropTypes.func.isRequired,
};

TextEditor.defaultProps = {
    isSingleLine: false,
    isMarkdown: false,
    sources: [],
};

export default TextEditor;