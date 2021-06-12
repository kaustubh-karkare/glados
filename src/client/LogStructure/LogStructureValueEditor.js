import React from 'react';
import PropTypes from 'prop-types';
import {
    Selector, TextEditor, TypeaheadInput, TypeaheadSelector,
} from '../Common';
import { LogTopicOptions } from '../LogTopic';
import { LogStructure, getPartialItem } from '../../data';

class LogStructureValueEditor extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    update(value) {
        const logKey = { ...this.props.logKey };
        if (logKey.type === LogStructure.Key.LOG_TOPIC && value) {
            value = getPartialItem(value);
        }
        logKey.value = value;
        this.props.onChange(logKey);
    }

    focus() {
        this.ref.current.focus();
    }

    render() {
        const { logKey } = this.props;
        const disabled = this.props.disabled || !!logKey.template;
        if (logKey.type === LogStructure.Key.YES_OR_NO) {
            return (
                <Selector.Binary
                    value={logKey.value === 'yes'}
                    disabled={disabled}
                    onChange={(value) => this.update(value ? 'yes' : 'no')}
                    ref={this.ref}
                />
            );
        } if (logKey.type === LogStructure.Key.LOG_TOPIC) {
            return (
                <TypeaheadSelector
                    id="log-structure-value-editor-topic"
                    options={LogTopicOptions.get({ parentLogTopic: logKey.parentLogTopic })}
                    value={logKey.value}
                    disabled={disabled}
                    onChange={(value) => this.update(value)}
                    where={{ parent_topic_id: logKey.parentLogTopic.id }}
                    ref={this.ref}
                />
            );
        } if (logKey.type === LogStructure.Key.RICH_TEXT_LINE) {
            return (
                <TextEditor
                    isSingleLine
                    serverSideTypes={['log-topic']}
                    value={logKey.value}
                    disabled={disabled}
                    onChange={(value) => this.update(value)}
                    ref={this.ref}
                />
            );
        }
        return (
            <TypeaheadInput
                id={logKey.name}
                value={logKey.value || ''}
                disabled={disabled}
                onChange={(value) => this.update(value)}
                onSearch={(query) => this.props.onSearch(query)}
                ref={this.ref}
            />
        );
    }
}

LogStructureValueEditor.propTypes = {
    logKey: PropTypes.Custom.LogStructureKey.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
};

export default LogStructureValueEditor;
