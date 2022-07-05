import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import { getPartialItem, LogStructure } from '../../common/data_types';
import {
    Selector, TextInput, TypeaheadOptions, TypeaheadSelector,
} from '../Common';
import { LogKeyListEditor } from '../LogKey';
import LogStructureFrequencyEditor from './LogStructureFrequencyEditor';

const { LogLevel } = LogStructure;

class LogStructureEditor extends React.Component {
    constructor(props) {
        super(props);
        this.nameRef = React.createRef();
    }

    componentDidMount() {
        this.nameRef.current.focus();
    }

    updateLogStructure(methodOrName, maybeValue) {
        const updatedLogStructure = { ...this.props.logStructure };
        if (typeof methodOrName === 'function') {
            methodOrName(updatedLogStructure);
        } else {
            updatedLogStructure[methodOrName] = maybeValue;
        }
        LogStructure.trigger(updatedLogStructure);
        this.props.onChange(updatedLogStructure);
    }

    renderGroup() {
        const options = new TypeaheadOptions({
            serverSideOptions: [{ name: 'log-structure-group' }],
            onSelect: async (option) => window.api.send('log-structure-group-load', option),
        });
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Group
                </InputGroup.Text>
                <TypeaheadSelector
                    id="log-structure-editor-structure-group"
                    options={options}
                    value={this.props.logStructure.logStructureGroup}
                    disabled={this.props.disabled}
                    onChange={(logStructureGroup) => this.updateLogStructure(
                        'logStructureGroup',
                        logStructureGroup,
                    )}
                />
            </InputGroup>
        );
    }

    renderName() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Name
                </InputGroup.Text>
                <TextInput
                    value={this.props.logStructure.name}
                    disabled={this.props.disabled}
                    onChange={(name) => this.updateLogStructure('name', name)}
                    ref={this.nameRef}
                />
            </InputGroup>
        );
    }

    renderNeedsEditSelector() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Needs Edit?
                </InputGroup.Text>
                <Selector.Binary
                    value={this.props.logStructure.needsEdit}
                    disabled={this.props.disabled}
                    onChange={(needsEdit) => this.updateLogStructure('needsEdit', needsEdit)}
                />
            </InputGroup>
        );
    }

    renderAllowEventDetailsSelector() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Event Details?
                </InputGroup.Text>
                <Selector.Binary
                    value={this.props.logStructure.allowEventDetails}
                    disabled={this.props.disabled}
                    onChange={(allowEventDetails) => this.updateLogStructure('allowEventDetails', allowEventDetails)}
                />
            </InputGroup>
        );
    }

    renderLogLevelSelector() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Log Level
                </InputGroup.Text>
                <Selector
                    options={LogLevel.Options}
                    value={LogLevel.getValue(this.props.logStructure.logLevel)}
                    disabled={this.props.disabled}
                    onChange={(value) => this.updateLogStructure('logLevel', LogLevel.getIndex(value))}
                />
            </InputGroup>
        );
    }

    renderIsDeprecated() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Is Deprecated?
                </InputGroup.Text>
                <Selector.Binary
                    value={this.props.logStructure.isDeprecated}
                    disabled={this.props.disabled}
                    onChange={(isDeprecated) => this.updateLogStructure('isDeprecated', isDeprecated)}
                />
            </InputGroup>
        );
    }

    render() {
        const { logStructure } = this.props;
        return (
            <>
                <div className="my-3">
                    {this.renderGroup()}
                    {this.renderName()}
                </div>
                <div className="my-3">
                    <LogKeyListEditor
                        templateLabel="Event Title Template"
                        templateValue={logStructure.eventTitleTemplate}
                        templateOptions={new TypeaheadOptions({
                            prefixOptions: [
                                getPartialItem(logStructure),
                                ...logStructure.eventKeys,
                            ],
                            serverSideOptions: [
                                { name: 'log-topic' },
                                { name: 'log-structure' },
                            ],
                        })}
                        onTemplateChange={
                            (eventTitleTemplate) => this.updateLogStructure('eventTitleTemplate', eventTitleTemplate)
                        }
                        logKeys={logStructure.eventKeys}
                        onLogKeysChange={(eventKeys) => {
                            this.updateLogStructure((updatedLogStructure) => {
                                // eslint-disable-next-line no-param-reassign
                                updatedLogStructure.eventKeys = eventKeys;
                            });
                        }}
                        onValueSearch={(query, index) => window.api.send('value-typeahead', {
                            logStructure: this.props.logStructure,
                            query,
                            index,
                        })}
                        disabled={this.props.disabled}
                    />
                    {this.renderNeedsEditSelector()}
                    {this.renderAllowEventDetailsSelector()}
                </div>
                <div className="my-3">
                    <LogStructureFrequencyEditor
                        logStructure={logStructure}
                        disabled={this.props.disabled}
                        updateLogStructure={(...args) => this.updateLogStructure(...args)}
                    />
                </div>
                <div className="my-3">
                    {this.renderLogLevelSelector()}
                    {this.renderIsDeprecated()}
                </div>
            </>
        );
    }
}

LogStructureEditor.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogStructureEditor;
