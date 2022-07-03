import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import { LogKey } from '../../common/data_types';
import {
    Selector, TextEditor, TextInput, TypeaheadOptions, TypeaheadSelector,
} from '../Common';
import LogStructureValueEditor from './LogValueEditor';

class LogKeyEditor extends React.Component {
    static getDerivedStateFromProps(props) {
        return {
            logKey: props.logKeys[props.index],
        };
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    update(methodOrName, maybeValue) {
        const logKey = { ...this.state.logKey };
        if (typeof methodOrName === 'function') {
            methodOrName(logKey);
        } else {
            logKey[methodOrName] = maybeValue;
        }
        this.props.onChange(logKey);
    }

    updateType(newType) {
        const logKey = { ...this.state.logKey };
        logKey.type = newType;
        logKey.value = LogKey.Type[newType].default;
        this.props.onChange(logKey);
    }

    renderTypeSelector() {
        return (
            <Selector
                value={this.state.logKey.type}
                options={LogKey.Type.Options}
                disabled={this.props.disabled}
                onChange={(type) => this.updateType(type)}
                style={{ borderRight: '2px solid transparent' }}
            />
        );
    }

    renderNameInput() {
        return (
            <TextInput
                placeholder="Key Name"
                value={this.state.logKey.name}
                disabled={this.props.disabled}
                onChange={(name) => this.update('name', name)}
            />
        );
    }

    renderParentLogTopic() {
        return (
            <TypeaheadSelector
                id="log-structure-key-editor-parent-topic"
                options={TypeaheadOptions.getFromTypes(['log-topic'])}
                value={this.state.logKey.parentLogTopic}
                disabled={this.props.disabled}
                onChange={(parentLogTopic) => this.update('parentLogTopic', parentLogTopic)}
                placeholder="Parent Topic"
            />
        );
    }

    renderOptionalSelector() {
        return (
            <Selector.Binary
                value={this.state.logKey.isOptional}
                disabled={this.props.disabled}
                onChange={(isOptional) => this.update('isOptional', isOptional)}
                yesLabel="Optional"
                noLabel="Required"
                style={{ borderLeft: '1px solid transparent' }}
            />
        );
    }

    renderValue() {
        if (this.state.logKey.isOptional) {
            return null;
        }
        return (
            <LogStructureValueEditor
                logKey={this.state.logKey}
                disabled={this.props.disabled}
                onChange={this.props.onChange}
                onSearch={(query) => Promise.resolve([])}
            />
        );
    }

    renderKeyTemplate() {
        return (
            <TextEditor
                isSingleLine
                value={this.state.logKey.template}
                options={new TypeaheadOptions({
                    prefixOptions: this.props.logKeys.slice(0, this.props.index),
                    serverSideOptions: [],
                })}
                disabled={this.props.disabled}
                onChange={(template) => this.update('template', template)}
            />
        );
    }

    renderEnumValuesSelector() {
        const { logKey } = this.state;
        return (
            <TypeaheadSelector
                id="log-structure-key-editor-enum-values"
                multiple
                options={TypeaheadSelector.getStringListTypeaheadOptions(
                    (query) => this.props.onSearch(query, this.props.index),
                )}
                value={TypeaheadSelector.getStringListItems(logKey.enumValues)}
                disabled={this.props.disabled}
                onChange={(items) => this.update('enumValues', items.map((item) => item.name))}
                placeholder="Enum Values"
            />
        );
    }

    renderEnumValuesSection() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text style={{ width: 100 }}>
                    Enum Values
                </InputGroup.Text>
                {this.renderEnumValuesSelector()}
            </InputGroup>
        );
    }

    render() {
        // eslint-disable-next-line react/prop-types
        const children = this.props.children || [];
        return (
            <div className="log-structure-key my-2">
                <InputGroup className="my-1">
                    {children.shift()}
                    <InputGroup.Text style={{ width: 108 }}>
                        Key
                    </InputGroup.Text>
                    {this.renderTypeSelector()}
                    {this.renderNameInput()}
                    {this.state.logKey.type === LogKey.Type.LOG_TOPIC
                        ? this.renderParentLogTopic() : null}
                    {this.renderOptionalSelector()}
                    {this.renderValue()}
                    {children.pop()}
                </InputGroup>
                <InputGroup className="my-1">
                    <InputGroup.Text style={{ width: 128 }}>
                        Key Template
                    </InputGroup.Text>
                    {this.renderKeyTemplate()}
                </InputGroup>
                {this.state.logKey.type === LogKey.Type.ENUM
                    ? this.renderEnumValuesSection() : null}
            </div>
        );
    }
}

LogKeyEditor.propTypes = {
    logKeys: PropTypes.arrayOf(PropTypes.Custom.LogKey.isRequired).isRequired,
    index: PropTypes.number.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
};

export default LogKeyEditor;
