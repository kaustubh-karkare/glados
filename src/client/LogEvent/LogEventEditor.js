import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import {
    DatePicker, Selector, TextEditor, TextInput, TypeaheadSelector,
} from '../Common';
import { LogEvent } from '../../data';
import PropTypes from '../prop-types';
import LogEventValueEditor from './LogEventValueEditor';


class LogEventEditor extends React.Component {
    async onSelectSuggestion(option) {
        if (option.__type__ === 'log-topic') {
            const logTopic = await window.api.send('log-topic-load', option);
            if (logTopic.hasStructure) {
                this.updateLogStructure(logTopic);
            }
        }
    }

    updateLogEvent(methodOrName, maybeValue) {
        const updatedLogEvent = { ...this.props.logEvent };
        if (typeof methodOrName === 'function') {
            methodOrName(updatedLogEvent);
        } else {
            updatedLogEvent[methodOrName] = maybeValue;
        }
        LogEvent.trigger(updatedLogEvent);
        this.props.onChange(updatedLogEvent);
    }

    updateLogStructure(logTopic) {
        if (logTopic) {
            window.api.send('log-structure-list', { where: { topic_id: logTopic.id } })
                .then(([logStructure]) => this.updateLogEvent('logStructure', logStructure));
        } else {
            this.updateLogEvent('logStructure', null);
        }
    }

    renderDateRow() {
        let element;
        if (this.props.logEvent.date) {
            element = (
                <DatePicker
                    value={this.props.logEvent.date}
                    disabled={this.props.disabled}
                    onChange={(date) => this.updateLogEvent('date', date)}
                />
            );
        } else {
            element = <TextInput disabled value="NA" />;
        }
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Date
                </InputGroup.Text>
                {element}
            </InputGroup>
        );
    }

    renderTitleRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Title
                </InputGroup.Text>
                <TextEditor
                    isSingleLine
                    focusOnLoad
                    value={this.props.logEvent.title}
                    serverSideTypes={['log-topic']}
                    disabled={this.props.disabled || !!this.props.logEvent.logStructure}
                    onChange={(title) => this.updateLogEvent('title', title)}
                    onSpecialKeys={this.props.onSpecialKeys}
                    onSelectSuggestion={(option) => this.onSelectSuggestion(option)}
                />
            </InputGroup>
        );
    }

    renderDetailsRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Details
                </InputGroup.Text>
                <TextEditor
                    value={this.props.logEvent.details}
                    serverSideTypes={['log-topic']}
                    disabled={this.props.disabled}
                    onChange={(details) => this.updateLogEvent('details', details)}
                />
            </InputGroup>
        );
    }

    renderIsMajorRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Is Major?
                </InputGroup.Text>
                <Selector.Binary
                    value={this.props.logEvent.isMajor}
                    disabled={this.props.disabled}
                    onChange={(isMajor) => this.updateLogEvent('isMajor', isMajor)}
                />
            </InputGroup>
        );
    }

    renderIsCompleteRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Is Complete?
                </InputGroup.Text>
                <Selector.Binary
                    value={this.props.logEvent.isComplete}
                    disabled={this.props.disabled}
                    onChange={(isComplete) => this.updateLogEvent('isComplete', isComplete)}
                />
            </InputGroup>
        );
    }

    renderStructureSelector() {
        const { logStructure } = this.props.logEvent;
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Structure
                </InputGroup.Text>
                <TypeaheadSelector
                    dataType="log-topic"
                    where={{ has_structure: true }}
                    value={logStructure ? logStructure.logTopic : null}
                    disabled={this.props.disabled}
                    onChange={(logTopic) => this.updateLogStructure(logTopic)}
                    allowDelete
                />
            </InputGroup>
        );
    }

    renderStructureValues() {
        const { logEvent } = this.props;
        if (!logEvent.logStructure) {
            return null;
        }
        return logEvent.logStructure.logKeys.map((logKey, index) => (
            <LogEventValueEditor
                key={logKey.id}
                logStructure={logEvent.logStructure}
                index={index}
                disabled={this.props.disabled}
                onChange={(updatedLogKey) => this.updateLogEvent((updatedLogEvent) => {
                    updatedLogEvent.logStructure.logKeys[index] = updatedLogKey;
                })}
            />
        ));
    }

    render() {
        return (
            <div>
                <div className="my-3">
                    {this.renderDateRow()}
                </div>
                {this.renderTitleRow()}
                {this.renderDetailsRow()}
                {this.renderIsMajorRow()}
                {this.renderIsCompleteRow()}
                <div className="my-3">
                    {this.renderStructureSelector()}
                    {this.renderStructureValues()}
                </div>
            </div>
        );
    }
}

LogEventEditor.propTypes = {
    logEvent: PropTypes.Custom.LogEvent.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSpecialKeys: PropTypes.func,
};

export default LogEventEditor;
