import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import deepcopy from '../../common/deepcopy';
import {
    DatePicker, TextEditor, TextInput, TypeaheadSelector, TypeaheadInput,
} from '../Common';
import { LogEvent } from '../../data';
import PropTypes from '../prop-types';


class LogEventEditor extends React.Component {
    onValueSearch(query, index) {
        return window.api.send('value-typeahead', {
            structure_id: this.props.logEvent.logStructure.id,
            query,
            index,
        });
    }

    updateLogEvent(method) {
        const logEvent = { ...this.props.logEvent };
        method(logEvent);
        LogEvent.trigger(logEvent);
        this.props.onChange(logEvent);
    }

    updateLogValue(index, value) {
        const logEvent = deepcopy(this.props.logEvent);
        logEvent.logStructure.logKeys[index].value = value;
        LogEvent.trigger(logEvent);
        this.props.onChange(logEvent);
    }

    renderDateRow() {
        let element;
        if (this.props.logEvent.date) {
            element = (
                <DatePicker
                    value={this.props.logEvent.date}
                    disabled={this.props.disabled}
                    onChange={(newDate) => this.updateLogEvent((logEvent) => {
                        logEvent.date = newDate;
                    })}
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
                    onChange={(newTitle) => this.updateLogEvent((logEvent) => {
                        // eslint-disable-next-line no-param-reassign
                        logEvent.title = newTitle;
                    })}
                    onSpecialKeys={this.props.onSpecialKeys}
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
                    onChange={(value) => this.updateLogEvent((logEvent) => {
                        // eslint-disable-next-line no-param-reassign
                        logEvent.details = value;
                    })}
                />
            </InputGroup>
        );
    }

    renderStructureSelector() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Structure
                </InputGroup.Text>
                <TypeaheadSelector
                    dataType="log-structure"
                    value={this.props.logEvent.logStructure}
                    disabled={this.props.disabled}
                    onChange={(logStructure) => this.updateLogEvent((logEvent) => {
                        // eslint-disable-next-line no-param-reassign
                        if (logStructure) {
                            logStructure.logKeys.forEach((logKey) => {
                                logKey.value = '';
                            });
                        }
                        logEvent.logStructure = logStructure;
                    })}
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
            <InputGroup key={logKey.name} className="my-1">
                <InputGroup.Text>
                    {logKey.name}
                </InputGroup.Text>
                <TypeaheadInput
                    id={`value-${logEvent.logStructure.id}-${index}`}
                    value={logKey.value}
                    disabled={this.props.disabled}
                    onChange={(newValue) => this.updateLogValue(index, newValue)}
                    onSearch={(query) => this.onValueSearch(query, index)}
                />
            </InputGroup>
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
