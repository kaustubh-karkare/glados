import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import {
    Selector, TextInput, TypeaheadSelector,
} from '../Common';
import { LogStructure } from '../../data';
import PropTypes from '../prop-types';

class LogStructureKeyEditor extends React.Component {
    update(methodOrName, maybeValue) {
        const logStructureKey = { ...this.props.logStructureKey };
        if (typeof methodOrName === 'function') {
            methodOrName(logStructureKey);
        } else {
            logStructureKey[methodOrName] = maybeValue;
        }
        this.props.onChange(logStructureKey);
    }

    renderTypeSelector() {
        return (
            <Selector
                value={this.props.logStructureKey.type}
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
                value={this.props.logStructureKey.name}
                disabled={this.props.disabled}
                onChange={(name) => this.update('name', name)}
            />
        );
    }

    renderParentLogTopic() {
        return (
            <TypeaheadSelector
                dataType="log-topic"
                value={this.props.logStructureKey.parentLogTopic}
                disabled={this.props.disabled}
                onChange={(parentLogTopic) => this.update('parentLogTopic', parentLogTopic)}
                placeholder="Parent Topic"
            />
        );
    }

    renderOptionalSelector() {
        return (
            <Selector.Binary
                value={this.props.logStructureKey.isOptional}
                disabled={this.props.disabled}
                onChange={(isOptional) => this.update('isOptional', isOptional)}
                yesLabel="Optional"
                noLabel="Required"
                style={{ borderLeft: '1px solid transparent' }}
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
                {this.props.logStructureKey.type === LogStructure.Key.LOG_TOPIC
                    ? this.renderParentLogTopic() : null}
                {this.renderOptionalSelector()}
                {children.pop()}
            </InputGroup>
        );
    }
}

LogStructureKeyEditor.propTypes = {
    logStructureKey: PropTypes.Custom.LogStructureKey.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogStructureKeyEditor;
