import Editor from 'draft-js-plugins-editor';
import {
    EditorState, RichUtils, convertFromRaw, convertToRaw,
} from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';

import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';

import 'draft-js/dist/Draft.css';

const plugins = [createMarkdownShortcutsPlugin()];

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

class GenericTextArea extends React.Component {
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
        };
        this.mentionPlugin = createMentionPlugin();
    }

    onSearchChange({ value }) {
        this.setState({
            suggestions: defaultSuggestionsFilter(value, mentions),
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
            <div id="root-editor">
                <Editor
                    editorState={this.state.editorState}
                    handleKeyCommand={
                        (command, editorState) => this.handleKeyCommand(command, editorState)
                    }
                    plugins={[
                        ...plugins,
                        this.mentionPlugin,
                    ]}
                    onChange={(editorState) => this.onChange(editorState)}
                />
                <MentionSuggestions
                    onSearchChange={(data) => this.onSearchChange(data)}
                    suggestions={this.state.suggestions}
                />
            </div>
        );
    }
}

GenericTextArea.propTypes = {
    value: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default GenericTextArea;
