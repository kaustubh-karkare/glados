import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from 'prop-types';
import {
    DatePicker, Selector, TextEditor, TypeaheadOptions, TypeaheadSelector,
} from '../Common';
import { LogEvent } from '../../data';
import { LogStructureValueEditor } from '../LogStructure';


const { LogLevel } = LogEvent;

class LogEventEditor extends React.Component {
    constructor(props) {
        super(props);
        this.titleRef = React.createRef();
        this.detailsRef = React.createRef();
        this.valueRef = React.createRef();
    }

    componentDidMount() {
        const { logEvent } = this.props;
        if (logEvent.logStructure) {
            if (logEvent.logStructure.logKeys.length) {
                this.valueRef.current.focus();
            } else {
                this.detailsRef.current.focus();
            }
        } else {
            this.titleRef.current.focus();
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

    renderDate() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    {this.props.logEvent.isComplete ? 'Date' : 'Deadline Date'}
                </InputGroup.Text>
                <DatePicker
                    date={this.props.logEvent.date}
                    disabled={this.props.disabled}
                    onChange={(date) => this.updateLogEvent('date', date)}
                />
            </InputGroup>
        );
    }

    renderIsComplete() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Complete?
                </InputGroup.Text>
                <Selector.Binary
                    value={this.props.logEvent.isComplete}
                    disabled={this.props.disabled}
                    onChange={(isComplete) => this.updateLogEvent('isComplete', isComplete)}
                />
            </InputGroup>
        );
    }

    renderMode() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Mode
                </InputGroup.Text>
                <TypeaheadSelector
                    id="log-event-editor-mode"
                    serverSideTypes={['log-mode']}
                    value={this.props.logEvent.logMode}
                    disabled={this.props.logEvent.logStructure ? true : this.props.disabled}
                    onChange={(logMode) => this.updateLogEvent(
                        'logMode',
                        logMode,
                    )}
                />
            </InputGroup>
        );
    }

    renderTitle() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Title
                </InputGroup.Text>
                <TextEditor
                    isSingleLine
                    value={this.props.logEvent.title}
                    options={new TypeaheadOptions({
                        serverSideOptions: [{ name: 'log-structure' }, { name: 'log-topic' }],
                        onSelect: async (option) => {
                            if (option.__type__ === 'log-structure') {
                                const logStructure = await window.api.send('log-structure-load', option);
                                this.updateLogEvent('logStructure', logStructure);
                            }
                        },
                    })}
                    disabled={this.props.disabled || !!this.props.logEvent.logStructure}
                    onChange={(title) => this.updateLogEvent('title', title)}
                    onSpecialKeys={this.props.onSpecialKeys}
                    ref={this.titleRef}
                />
            </InputGroup>
        );
    }

    renderDetails() {
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
                    ref={this.detailsRef}
                />
            </InputGroup>
        );
    }

    renderLogLevel() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Log Level
                </InputGroup.Text>
                <Selector
                    options={LogLevel.Options}
                    value={LogLevel.getValue(this.props.logEvent.logLevel)}
                    disabled={this.props.disabled}
                    onChange={(value) => this.updateLogEvent('logLevel', LogLevel.getIndex(value))}
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
                    id="log-event-editor-structure"
                    options={new TypeaheadOptions({
                        serverSideOptions: [{ name: 'log-structure' }],
                        onSelect: (option) => window.api.send('log-structure-load', option),
                    })}
                    value={this.props.logEvent.logStructure}
                    disabled={this.props.disabled}
                    onChange={(logStructure) => this.updateLogEvent((updatedLogEvent) => {
                        updatedLogEvent.logStructure = logStructure;
                        if (!logStructure) updatedLogEvent.title = '';
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
            <InputGroup className="my-1" key={logKey.id}>
                <InputGroup.Text>
                    {logKey.name}
                </InputGroup.Text>
                <LogStructureValueEditor
                    logKey={logKey}
                    disabled={this.props.disabled}
                    onChange={(updatedLogKey) => this.updateLogEvent((updatedLogEvent) => {
                        updatedLogEvent.logStructure.logKeys[index] = updatedLogKey;
                    })}
                    onSearch={(query) => window.api.send('value-typeahead', {
                        logStructure: this.props.logEvent.logStructure,
                        query,
                        index,
                    })}
                    ref={index === 0 ? this.valueRef : null}
                />
            </InputGroup>
        ));
    }

    render() {
        return (
            <div>
                <div className="my-3">
                    {this.renderDate()}
                    {this.renderIsComplete()}
                </div>
                <div className="my-3">
                    {this.renderMode()}
                    {this.renderTitle()}
                    {this.renderDetails()}
                </div>
                {this.renderLogLevel()}
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
