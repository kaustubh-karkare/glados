import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import { LogTopic } from '../../common/data_types';
import {
    Selector, TextInput, TypeaheadOptions, TypeaheadSelector,
} from '../Common';
import { LogKeyListEditor, LogValueListEditor } from '../LogKey';

class LogTopicEditor extends React.Component {
    constructor(props) {
        super(props);
        this.nameRef = React.createRef();
    }

    componentDidMount() {
        this.nameRef.current.focus();
    }

    updateLogTopic(methodOrName, maybeValue) {
        const updatedLogTopic = { ...this.props.logTopic };
        if (typeof methodOrName === 'function') {
            methodOrName(updatedLogTopic);
        } else {
            updatedLogTopic[methodOrName] = maybeValue;
        }
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
        const { parentLogTopic } = this.props.logTopic;
        const isNameDerived = parentLogTopic ? parentLogTopic.childNameTemplate !== null : false;
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Name
                </InputGroup.Text>
                <TextInput
                    value={this.props.logTopic.name}
                    disabled={this.props.disabled || isNameDerived}
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

    renderValues() {
        const { parentLogTopic } = this.props.logTopic;
        if (!parentLogTopic || !parentLogTopic.childKeys) {
            return null;
        }
        return (
            <LogValueListEditor
                source={parentLogTopic}
                logKeys={parentLogTopic.childKeys}
                disabled={this.props.disabled}
                onChange={(updatedChildKeys) => this.updateLogTopic((updatedLogTopic) => {
                    updatedLogTopic.parentLogTopic.childKeys = updatedChildKeys;
                })}
            />
        );
    }

    renderChildKeys() {
        const { logTopic } = this.props;
        let logKeyList;
        if (logTopic.childKeys) {
            logKeyList = (
                <LogKeyListEditor
                    templateLabel="Child Name Template"
                    templateValue={logTopic.childNameTemplate}
                    templateOptions={new TypeaheadOptions({
                        prefixOptions: logTopic.childKeys,
                        serverSideOptions: [],
                    })}
                    onTemplateChange={(childNameTemplate) => this.updateLogTopic('childNameTemplate', childNameTemplate)}
                    logKeys={logTopic.childKeys || []}
                    onLogKeysChange={(newChildKeys) => this.updateLogTopic('childKeys', newChildKeys)}
                    onValueSearch={(query, index) => { throw new Error('not implemented'); }}
                    disabled={this.props.disabled}
                />
            );
        }
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Enable Child Keys?
                    </InputGroup.Text>
                    <Selector.Binary
                        value={!!logTopic.childKeys}
                        disabled={this.props.disabled}
                        onChange={(enableChildKeys) => this.updateLogTopic((updatedLogTopic) => {
                            if (!enableChildKeys) {
                                updatedLogTopic._childKeys = updatedLogTopic.childKeys;
                                updatedLogTopic.childKeys = null;
                            } else {
                                updatedLogTopic.childKeys = updatedLogTopic._childKeys || [];
                            }
                        })}
                    />
                </InputGroup>
                {logKeyList}
            </>
        );
    }

    render() {
        return (
            <>
                <div className="my-3">
                    {this.renderParent()}
                    {this.renderValues()}
                </div>
                <div className="my-3">
                    {this.renderName()}
                </div>
                <div className="my-3">
                    {this.renderIsDeprecated()}
                </div>
                <div className="my-3">
                    {this.renderChildKeys()}
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
