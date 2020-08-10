import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from 'prop-types';
import {
    Selector, TextInput, TypeaheadSelector,
} from '../Common';
import { LogStructure } from '../../data';
import LogStructureValueEditor from './LogStructureValueEditor';

class LogStructureKeyEditor extends React.Component {
    update(methodOrName, maybeValue) {
        const logKey = { ...this.props.logKey };
        if (typeof methodOrName === 'function') {
            methodOrName(logKey);
        } else {
            logKey[methodOrName] = maybeValue;
        }
        this.props.onChange(logKey);
    }

    renderTypeSelector() {
        return (
            <Selector
                value={this.props.logKey.type}
                options={LogStructure.Key.Options}
                disabled={this.props.disabled}
                onChange={(type) => this.update('type', type)}
                style={{ borderRight: '2px solid transparent' }}
            />
        );
    }

    renderNameInput() {
        return (
            <TextInput
                value={this.props.logKey.name}
                disabled={this.props.disabled}
                onChange={(name) => this.update('name', name)}
            />
        );
    }

    renderParentLogTopic() {
        return (
            <TypeaheadSelector
                id="log-structure-key-editor-parent-topic"
                serverSideTypes={['log-topic']}
                value={this.props.logKey.parentLogTopic}
                disabled={this.props.disabled}
                onChange={(parentLogTopic) => this.update('parentLogTopic', parentLogTopic)}
                placeholder="Parent Topic"
            />
        );
    }

    renderOptionalSelector() {
        return (
            <Selector.Binary
                value={this.props.logKey.isOptional}
                disabled={this.props.disabled}
                onChange={(isOptional) => this.update('isOptional', isOptional)}
                yesLabel="Optional"
                noLabel="Required"
                style={{ borderLeft: '1px solid transparent' }}
            />
        );
    }

    renderValue() {
        if (this.props.logKey.isOptional) {
            return null;
        }
        return (
            <LogStructureValueEditor
                logKey={this.props.logKey}
                disabled={this.props.disabled}
                onChange={this.props.onChange}
                onSearch={(query) => Promise.resolve([])}
            />
        );
    }

    render() {
        // eslint-disable-next-line react/prop-types
        const children = this.props.children || [];
        return (
            <InputGroup className="my-1">
                {children.shift()}
                <InputGroup.Text style={{ width: 80 }}>
                    Key
                </InputGroup.Text>
                {this.renderTypeSelector()}
                {this.renderNameInput()}
                {this.props.logKey.type === LogStructure.Key.LOG_TOPIC
                    ? this.renderParentLogTopic() : null}
                {this.renderOptionalSelector()}
                {this.renderValue()}
                {children.pop()}
            </InputGroup>
        );
    }
}

LogStructureKeyEditor.propTypes = {
    logKey: PropTypes.Custom.LogStructureKey.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogStructureKeyEditor;
