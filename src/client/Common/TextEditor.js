
import Editor from 'draft-js-plugins-editor';
import { RichUtils } from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';

// Using a local copy of the plugin until the PR is merged.
// https://github.com/draft-js-plugins/draft-js-plugins/pull/1419
// cp -r ../draft-js-plugins/draft-js-mention-plugin src/client/Common
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
import createMentionPlugin, { defaultSuggestionsFilter } from './draft-js-mention-plugin/src';

import assert from '../../common/assert';
import TextEditorUtils from '../../common/TextEditorUtils';
import Utils from '../../data/Utils';
import { combineClassNames } from './Utils';
import AddLinkPlugin from './AddLinkPlugin';

import 'draft-js/dist/Draft.css';


function TextEditorMention(props) {
    const item = props.mention;
    return (
        <a
            className="mention"
            title={item.name}
            href="#"
        >
            {props.children}
        </a>
    );
}

TextEditorMention.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    mention: PropTypes.any.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};


class TextEditor extends React.Component {
    static getDerivedStateFromProps(props, state) {
        if (props.value === state.value) {
            return state;
        }
        // eslint-disable-next-line no-param-reassign
        state.value = props.value;

        if (state.value !== state.newValue) {
            // eslint-disable-next-line no-param-reassign
            state.editorState = TextEditorUtils.toEditorState(
                TextEditorUtils.deserialize(props.value),
            );
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

        if (this.props.isMarkdown) {
            this.markdownShortcutsPlugin = createMarkdownShortcutsPlugin();
            this.state.plugins.push(this.markdownShortcutsPlugin);
        }

        this.mentionPlugin = createMentionPlugin({
            mentionComponent: TextEditorMention,
            mentionTriggers: this.props.sources.map((suggestion) => suggestion.trigger),
        });
        this.state.plugins.push(this.mentionPlugin);
    }

    onSearchChange({ trigger, value: query }) {
        const selectedSource = this.props.sources
            .find((suggestion) => suggestion.trigger === trigger);
        assert(selectedSource, 'unknown suggestion for trigger');
        this.setState({ selectedSource });
        if (selectedSource.options) {
            this.setSuggestions(selectedSource, query, selectedSource.options);
        } else if (selectedSource.dataType) {
            window.api.send(`${selectedSource.dataType}-typeahead`, { trigger, query })
                .then((options) => this.setSuggestions(selectedSource, query, options));
        } else {
            assert(false, 'missing source');
        }
    }

    onAddMention(option) {
        if (this.props.onSelectSuggestion) {
            if (option[Utils.INCOMPLETE_KEY]) {
                assert(this.state.selectedSource.dataType);
                window.api.send(`${this.state.selectedSource.dataType}-load`, option)
                    .then((result) => this.props.onSelectSuggestion(result));
            } else {
                this.props.onSelectSuggestion(option);
            }
        }
    }

    onChange(editorState) {
        this.setState({ editorState });
        const oldValue = this.props.value;
        const newValue = TextEditorUtils.serialize(
            TextEditorUtils.fromEditorState(editorState),
        );
        if (oldValue !== newValue && this.props.onUpdate) {
            this.setState({ newValue }, () => this.props.onUpdate(newValue));
        }
    }

    setSuggestions(source, query, options) {
        this.setState({
            open: true,
            suggestions: defaultSuggestionsFilter(query, options),
        });
    }

    handleKeyCommand(command, editorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        if (this.props.isSingleLine && command === 'split-block') {
            if (this.props.onEnter) {
                this.props.onEnter();
            }
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
                    onOpenChange={(open) => this.setState({ open })}
                    onSearchChange={(data) => this.onSearchChange(data)}
                    onAddMention={(option) => this.onAddMention(option)}
                    suggestions={this.state.suggestions}
                />
            </div>
        );
    }

    render() {
        return (
            <div className={combineClassNames({
                'text-editor': true,
                'text-editor-normal': !this.props.unstyled,
                'text-editor-disabled': this.props.disabled,
            })}
            >
                <Editor
                    readOnly={this.props.disabled}
                    editorState={this.state.editorState}
                    handleKeyCommand={
                        (command, editorState) => this.handleKeyCommand(command, editorState)
                    }
                    plugins={this.state.plugins}
                    onChange={(editorState) => this.onChange(editorState)}
                    placeholder={this.props.placeholder}
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
    onUpdate: PropTypes.func,

    isSingleLine: PropTypes.bool,
    onEnter: PropTypes.func, // called if isSingleLine

    isMarkdown: PropTypes.bool,

    sources: PropTypes.arrayOf(
        PropTypes.shape({
            trigger: PropTypes.string.isRequired,
            options: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
            }).isRequired),
            dataType: PropTypes.string,
        }).isRequired,
    ),
    onSelectSuggestion: PropTypes.func,
};

TextEditor.defaultProps = {
    unstyled: false,
    disabled: false,
    isSingleLine: false,
    isMarkdown: false,
    sources: [],
};

export default TextEditor;
