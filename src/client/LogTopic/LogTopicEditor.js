import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import {
    TextInput, TypeaheadSelector,
} from '../Common';

class LogTopicEditor extends React.Component {
    constructor(props) {
        super(props);
        this.nameRef = React.createRef();
    }

    componentDidMount() {
        this.nameRef.current.focus();
    }

    updateLogTopic(name, value) {
        const updatedLogTopic = { ...this.props.logTopic };
        updatedLogTopic[name] = value;
        this.props.onChange(updatedLogTopic);
    }

    render() {
        const { logTopic } = this.props;
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Parent
                    </InputGroup.Text>
                    <TypeaheadSelector
                        id="log-topic-editor-parent-topic"
                        serverSideTypes={['log-topic']}
                        value={logTopic.parentLogTopic}
                        disabled={this.props.disabled}
                        onChange={(parentLogTopic) => this.updateLogTopic('parentLogTopic', parentLogTopic)}
                    />
                </InputGroup>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Name
                    </InputGroup.Text>
                    <TextInput
                        allowUpdate
                        dataType="log-topic"
                        value={logTopic.name}
                        disabled={this.props.disabled}
                        onChange={(name) => this.updateLogTopic('name', name)}
                        ref={this.nameRef}
                    />
                </InputGroup>
            </>
        );
    }
}

LogTopicEditor.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogTopicEditor;
