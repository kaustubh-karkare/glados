import React from 'react';
import PropTypes from 'prop-types';
import {
    Selector, TextEditor, TypeaheadInput, TypeaheadOptions, TypeaheadSelector,
} from '../Common';
import { LogTopicOptions } from '../LogTopic';
import { LogStructure, getPartialItem } from '../../data';

const STRING_TYPE = 'string';

class LogStructureValueEditor extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    // eslint-disable-next-line class-methods-use-this
    getStringListItems(value) {
        return value.map((subvalue, index) => ({
            __type__: STRING_TYPE,
            id: index + 1,
            name: subvalue,
        }));
    }

    getStringListTypeaheadOptions() {
        return new TypeaheadOptions({
            serverSideOptions: [],
            getComputedOptions: async (query) => {
                if (!query) {
                    return [];
                }
                let options = await this.props.onSearch(query);
                options = this.getStringListItems(options);
                options.push({
                    __type__: STRING_TYPE,
                    id: 0,
                    name: query,
                });
                return options;
            },
        });
    }

    focus() {
        this.ref.current.focus();
    }

    update(value) {
        const logKey = { ...this.props.logKey };
        if (logKey.type === LogStructure.Key.LOG_TOPIC && value) {
            value = getPartialItem(value);
        }
        logKey.value = value;
        this.props.onChange(logKey);
    }

    render() {
        const { logKey } = this.props;
        const disabled = this.props.disabled || !!logKey.template;
        const uniqueId = `log-structure-value-editor-${logKey.id}`;
        let { value } = logKey;
        if (typeof value === 'undefined') {
            value = LogStructure.Key[logKey.type].default;
        }
        if (logKey.type === LogStructure.Key.STRING_LIST) {
            return (
                <TypeaheadSelector
                    id={uniqueId}
                    options={this.getStringListTypeaheadOptions()}
                    value={this.getStringListItems(value)}
                    disabled={disabled}
                    onChange={(items) => this.update(items.map((item) => item.name))}
                    multiple
                    ref={this.ref}
                />
            );
        } if (logKey.type === LogStructure.Key.YES_OR_NO) {
            return (
                <Selector.Binary
                    value={value === 'yes'}
                    disabled={disabled}
                    onChange={(newValue) => this.update(newValue ? 'yes' : 'no')}
                    ref={this.ref}
                />
            );
        } if (logKey.type === LogStructure.Key.LOG_TOPIC) {
            return (
                <TypeaheadSelector
                    id={uniqueId}
                    options={LogTopicOptions.get({ parentLogTopic: logKey.parentLogTopic })}
                    value={value}
                    disabled={disabled}
                    onChange={(newValue) => this.update(newValue)}
                    where={{ parent_topic_id: logKey.parentLogTopic.id }}
                    ref={this.ref}
                />
            );
        } if (logKey.type === LogStructure.Key.RICH_TEXT_LINE) {
            return (
                <TextEditor
                    isSingleLine
                    serverSideTypes={['log-topic']}
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
