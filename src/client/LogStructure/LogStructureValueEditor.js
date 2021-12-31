import PropTypes from 'prop-types';
import React from 'react';

import { getPartialItem, LogStructure } from '../../common/data_types';
import {
    Selector, TextEditor, TypeaheadInput, TypeaheadOptions, TypeaheadSelector,
} from '../Common';
import { LogTopicOptions } from '../LogTopic';

class LogStructureValueEditor extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    focus() {
        this.ref.current.focus();
    }

    update(value) {
        const logKey = { ...this.props.logKey };
        if (logKey.type === LogStructure.Key.Type.LOG_TOPIC && value) {
            value = getPartialItem(value);
        }
        logKey.value = value;
        this.props.onChange(logKey);
    }

    render() {
        const { logKey } = this.props;
        const disabled = this.props.disabled || !!logKey.template;
        const uniqueId = `log-structure-value-editor-${logKey.__id__}`;
        let { value } = logKey;
        if (typeof value === 'undefined') {
            value = LogStructure.Key.Type[logKey.type].default;
        }
        if (logKey.type === LogStructure.Key.Type.STRING_LIST) {
            return (
                <TypeaheadSelector
                    id={uniqueId}
                    options={TypeaheadSelector.getStringListTypeaheadOptions(this.props.onSearch)}
                    value={TypeaheadSelector.getStringListItems(value)}
                    disabled={disabled}
                    onChange={(items) => this.update(items.map((item) => item.name))}
                    multiple
                    ref={this.ref}
                />
            );
        } if (logKey.type === LogStructure.Key.Type.YES_OR_NO) {
            return (
                <Selector.Binary
                    value={value === 'yes'}
                    disabled={disabled}
                    onChange={(newValue) => this.update(newValue ? 'yes' : 'no')}
                    ref={this.ref}
                />
            );
        } if (logKey.type === LogStructure.Key.Type.ENUM) {
            return (
                <Selector
                    options={Selector.getStringListOptions(logKey.enumValues)}
                    value={value}
                    disabled={disabled}
                    onChange={(newValue) => this.update(newValue)}
                    ref={this.ref}
                />
            );
        } if (logKey.type === LogStructure.Key.Type.LOG_TOPIC) {
            const parentLogTopicId = logKey.parentLogTopic
                ? logKey.parentLogTopic.__id__
                : undefined;
            return (
                <TypeaheadSelector
                    id={uniqueId}
                    options={LogTopicOptions.get({
                        allowCreation: true,
                        parentLogTopic: logKey.parentLogTopic,
                    })}
                    value={value}
                    disabled={disabled}
                    onChange={(newValue) => this.update(newValue)}
                    where={{ parent_topic_id: parentLogTopicId }}
                    ref={this.ref}
                />
            );
        } if (logKey.type === LogStructure.Key.Type.RICH_TEXT_LINE) {
            return (
                <TextEditor
                    isSingleLine
                    options={TypeaheadOptions.getFromTypes(['log-topic'])}
                    value={value}
                    disabled={disabled}
                    onChange={(newValue) => this.update(newValue)}
                    ref={this.ref}
                />
            );
        }
        return (
            <TypeaheadInput
                id={logKey.name}
                value={value || ''}
                disabled={disabled}
                onChange={(newValue) => this.update(newValue)}
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
