import {Editor, EditorState, RichUtils, convertFromRaw, convertToRaw} from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';

function deserialize(text) {
    if (!text) {
        return convertToRaw(EditorState.createEmpty().getCurrentContent());
    } else {
        return JSON.parse(text);
    }
}

function serialize(rawContent, isEmpty) {
    if (isEmpty) {
        return "";
    } else {
        return JSON.stringify(rawContent);
    }
}

class GenericTextArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    static getDerivedStateFromProps(props, state) {
        state.rawContent = deserialize(props.value);
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
    render() {
        return (
            <Editor
                editorState={this.state.editorState}
                handleKeyCommand={this.handleKeyCommand.bind(this)}
                onChange={this.onChange.bind(this)}
            />
        );
    }
    onChange(editorState) {
        this.setState({editorState});
        const rawContent = convertToRaw(editorState.getCurrentContent());
        const isEmpty = !editorState.getCurrentContent().hasText();
        if (serialize(this.state.rawContent) == serialize(rawContent)) {
            return;
        }
        const value = serialize(rawContent, isEmpty);
        // console.info("onUpdate", value);
        this.props.onUpdate(value);
    }
}

GenericTextArea.propTypes = {
    value: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default GenericTextArea;
