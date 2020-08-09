import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import {
    DatePicker, Selector, TextEditor, TypeaheadSelector,
} from '../Common';
import { LogEvent } from '../../data';
import PropTypes from '../prop-types';
import { LogStructureValueEditor } from '../LogStructure';


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

    async onSelectSuggestion(option) {
        if (option.__type__ === 'log-structure') {
            const logStructure = await window.api.send('log-structure-load', option);
            this.updateLogEvent('logStructure', logStructure);
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

    renderDateRow() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Date
                </InputGroup.Text>
                <DatePicker
                    date={this.props.logEvent.date}
                    disabled={this.props.disabled}
                    onChange={(date) => this.updateLogEvent('date', date)}
                />
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
                    value={this.props.logEvent.title}
                    serverSideTypes={['log-structure', 'log-topic']}
                    disabled={this.props.disabled || !!this.props.logEvent.logStructure}
                    onChange={(title) => this.updateLogEvent('title', title)}
                    onSpecialKeys={this.props.onSpecialKeys}
                    onSelectSuggestion={(option) => this.onSelectSuggestion(option)}
                    ref={this.titleRef}
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
                    ref={this.detailsRef}
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
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Structure
                </InputGroup.Text>
                <TypeaheadSelector
                    dataType="log-structure"
                    value={this.props.logEvent.logStructure}
                    disabled={this.props.disabled}
                    onChange={(logStructure) => this.updateLogEvent('logStructure', logStructure)}
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
                        structure_id: this.props.logEvent.logStructure.id,
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
