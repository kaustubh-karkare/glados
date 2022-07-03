import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';

import { LogKey, LogTopic } from '../../common/data_types';
import {
    Selector, TextInput, TypeaheadOptions, TypeaheadSelector,
} from '../Common';
import { LogKeyListEditor, LogValueEditor } from '../LogKey';

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

    renderValues() {
        const { childKeys } = this.props.logTopic.parentLogTopic;
        if (!childKeys) {
            return null;
        }
        return childKeys.map((logKey, index) => (
            <InputGroup className="my-1" key={logKey.__id__}>
                <InputGroup.Text>
                    {logKey.name}
                </InputGroup.Text>
                <LogValueEditor
                    logKey={logKey}
                    disabled={this.props.disabled}
                    onChange={(updatedLogKey) => this.updateLogTopic((updatedLogTopic) => {
                        updatedLogTopic.parentLogTopic.childKeys[index] = updatedLogKey;
                    })}
                    onSearch={(query) => window.api.send('value-typeahead', {
                        logStructure: this.props.logTopic,
                        query,
                        index,
                    })}
                    ref={index === 0 ? this.valueRef : null}
                />
            </InputGroup>
        ));
    }

    renderChildKeys() {
        const { childKeys } = this.props.logTopic;
        let button;
        let logKeyList;
        if (childKeys) {
            button = (
                <Button
                    className="log-topic-add-key"
                    disabled={this.props.disabled}
                    onClick={() => this.updateLogTopic(
                        'childKeys',
                        [...childKeys, LogKey.createVirtual()],
                    )}
                    style={{ height: 'inherit' }}
                >
                    <MdAddCircleOutline />
                </Button>
            );
            logKeyList = (
                <LogKeyListEditor
                    logKeys={this.props.logTopic.childKeys || []}
                    disabled={this.props.disabled}
                    onChange={(newChildKeys) => this.updateLogTopic('childKeys', newChildKeys)}
                    onSearch={(query, index) => { throw new Error('not implemented'); }}
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
                        value={!!childKeys}
                        disabled={this.props.disabled}
                        onChange={(enableChildKeys) => this.updateLogTopic((updatedLogTopic) => {
                            if (!enableChildKeys) {
                                updatedLogTopic._childKeys = childKeys;
                                updatedLogTopic.childKeys = null;
                            } else {
                                updatedLogTopic.childKeys = updatedLogTopic._childKeys || [];
                            }
                        })}
                    />
                    {button}
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
