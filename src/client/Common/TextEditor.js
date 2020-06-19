
import Editor from 'draft-js-plugins-editor';
import {
    EditorState, RichUtils, convertFromRaw, convertToRaw,
} from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';

// Using a local copy of the plugin until the PR is merged.
// https://github.com/draft-js-plugins/draft-js-plugins/pull/1419
// cp -r ../draft-js-plugins/draft-js-mention-plugin src/client/Common
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

// [{name, link, avatar}]
const mentions = [
    { name: 'Anurag Dubey' },
    { name: 'Kaustubh Karkare' },
    { name: 'Vishnu Mohandas' },
];

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
            suggestions: mentions,
            open: false,
            plugins: [],
        };

        if (this.props.isMarkdown) {
            this.markdownShortcutsPlugin = createMarkdownShortcutsPlugin();
            this.state.plugins.push(this.markdownShortcutsPlugin);
        }

        this.mentionPlugin = createMentionPlugin({
            mentionTriggers: this.props.suggestions.map((suggestion) => suggestion.trigger),
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
        const suggestion = this.props.suggestions
            .find((suggestion) => suggestion.trigger == trigger);
        assert(suggestion, 'unknown suggestion for trigger');
        this.setState({
            suggestions: defaultSuggestionsFilter(value, suggestion.source),
        });
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
    isMarkdown: PropTypes.bool.isRequired,
    isSingleLine: PropTypes.bool.isRequired,
    suggestions: PropTypes.arrayOf(
        PropTypes.shape({
            trigger: PropTypes.string.isRequired,
            source: PropTypes.any.isRequired,
        }).isRequired,
    ).isRequired,
    onUpdate: PropTypes.func.isRequired,
};

TextEditor.defaultProps = {
    isSingleLine: false,
    isMarkdown: false,
    suggestions: [],
};

export default TextEditor;
