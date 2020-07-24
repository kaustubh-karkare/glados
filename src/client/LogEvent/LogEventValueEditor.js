import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { TypeaheadInput, TypeaheadSelector } from '../Common';
import { LogStructure, getPartialItem } from '../../data';
import PropTypes from '../prop-types';

class LogEventValueEditor extends React.Component {
    onSearch(query) {
        return window.api.send('value-typeahead', {
            structure_id: this.props.logStructure.id,
            query,
            index: this.props.index,
        });
    }

    update(value) {
        const logKey = { ...this.props.logStructure.logKeys[this.props.index] };
        if (typeof value === 'object') {
            value = getPartialItem(value);
        }
        logKey.value = value;
        this.props.onChange(logKey);
    }

    renderInput(logKey) {
        if (logKey.type === LogStructure.KeyType.LOG_TOPIC) {
            return (
                <TypeaheadSelector
                    dataType="log-topic"
                    value={logKey.value}
                    disabled={this.props.disabled}
                    onChange={(value) => this.update(value)}
                    selector={{ parent_topic_id: logKey.parentLogTopic.id }}
                />
            );
        }
        return (
            <TypeaheadInput
                id={logKey.name}
                value={logKey.value || ''}
                disabled={this.props.disabled}
                onChange={(value) => this.update(value)}
                onSearch={(query) => this.onSearch(query)}
            />
        );
    }


    render() {
        const logKey = this.props.logStructure.logKeys[this.props.index];
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    {logKey.name}
                </InputGroup.Text>
                {this.renderInput(logKey)}
            </InputGroup>
        );
    }
}

LogEventValueEditor.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
    index: PropTypes.number.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogEventValueEditor;
