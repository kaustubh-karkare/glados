import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import { LogTopic } from '../../common/data_types';
import {
    Selector, TextInput, TypeaheadOptions, TypeaheadSelector,
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
        LogTopic.trigger(updatedLogTopic);
        this.props.onChange(updatedLogTopic);
    }

    renderParent() {
        const options = new TypeaheadOptions({
            serverSideOptions: [{ name: 'log-topic' }],
            onSelect: async (option) => window.api.send('log-topic-load', option),
        });
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Parent
                </InputGroup.Text>
                <TypeaheadSelector
                    id="log-topic-editor-parent-topic"
                    options={options}
                    value={this.props.logTopic.parentLogTopic}
                    disabled={this.props.disabled}
                    onChange={(parentLogTopic) => this.updateLogTopic('parentLogTopic', parentLogTopic)}
                />
            </InputGroup>
        );
    }

    renderName() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Name
                </InputGroup.Text>
                <TextInput
                    value={this.props.logTopic.name}
                    disabled={this.props.disabled}
                    onChange={(name) => this.updateLogTopic('name', name)}
                    ref={this.nameRef}
                />
            </InputGroup>
        );
    }

    renderIsDeprecated() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Is Deprecated?
                </InputGroup.Text>
                <Selector.Binary
                    value={this.props.logTopic.isDeprecated}
                    disabled={this.props.disabled}
                    onChange={(isDeprecated) => this.updateLogTopic('isDeprecated', isDeprecated)}
                />
            </InputGroup>
        );
    }

    render() {
        return (
            <>
                <div className="my-3">
                    {this.renderParent()}
                    {this.renderName()}
                </div>
                <div className="my-3">
                    {this.renderIsDeprecated()}
                </div>
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
