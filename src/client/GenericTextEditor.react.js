import Editor from 'draft-js-plugins-editor';
import {EditorState, RichUtils, convertFromRaw, convertToRaw} from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';

import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';

import 'draft-js/dist/Draft.css';

const plugins = [createMarkdownShortcutsPlugin()];

const SerializationUtils = {
    deserialize: function(text) {
        if (!text) {
            return convertToRaw(EditorState.createEmpty().getCurrentContent());
        } else {
            return JSON.parse(text);
        }
    },
    serialize: function(rawContent, isEmpty) {
        if (isEmpty) {
            return "";
        } else {
            return JSON.stringify(rawContent);
        }
    },
};

// [{name, link, avatar}]
const mentions = [
    {name: "Anurag Dubey"},
    {name: "Kaustubh Karkare"},
    {name: "Vishnu Mohandas"},
];

class GenericTextArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            suggestions: mentions,
        };
        this.mentionPlugin = createMentionPlugin();
    }
    static getDerivedStateFromProps(props, state) {
        state.rawContent = SerializationUtils.deserialize(props.value);
        if (!state.editorState) { // first time only
            state.editorState = EditorState.createWithContent(convertFromRaw(state.rawContent));
        }
        return state;
    }
    handleKeyCommand(command, editorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }
    onSearchChange = ({ value }) => {
        this.setState({
            suggestions: defaultSuggestionsFilter(value, mentions),
        });
    }
    onAddMention = (mentionedObject) => {
        // get the selected mentions object
    }
    render() {
        const { MentionSuggestions } = this.mentionPlugin;
        return (
            <div id="root-editor">
                <Editor
                    editorState={this.state.editorState}
                    handleKeyCommand={this.handleKeyCommand.bind(this)}
                    plugins={[
                        ...plugins,
                        this.mentionPlugin,
                    ]}
                    onChange={this.onChange.bind(this)}
                />
                <MentionSuggestions
                    onSearchChange={this.onSearchChange}
                    suggestions={this.state.suggestions}
                    onAddMention={this.onAddMention}
                />
            </div>
        );
    }
    onChange(editorState) {
        this.setState({editorState});
        const rawContent = convertToRaw(editorState.getCurrentContent());
        const isEmpty = !editorState.getCurrentContent().hasText();
        if (
            SerializationUtils.serialize(this.state.rawContent)
                == SerializationUtils.serialize(rawContent)
        ) {
            return;
        }
        const value = SerializationUtils.serialize(rawContent, isEmpty);
        console.info(value);
        this.props.onUpdate(value);
    }
}

GenericTextArea.propTypes = {
    value: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default GenericTextArea;
