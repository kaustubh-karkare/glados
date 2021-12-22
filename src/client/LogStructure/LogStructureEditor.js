import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import PropTypes from 'prop-types';
import {
    SortableList, Selector, TextEditor, TextInput, TypeaheadOptions, TypeaheadSelector,
} from '../Common';
import LogStructureFrequencyEditor from './LogStructureFrequencyEditor';
import LogStructureKeyEditor from './LogStructureKeyEditor';
import { LogStructure, getPartialItem } from '../../data';

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
                    allowUpdate
                    dataType="log-structure"
                    value={this.props.logStructure.name}
                    disabled={this.props.disabled}
                    onChange={(name) => this.updateLogStructure('name', name)}
                    ref={this.nameRef}
                />
            </InputGroup>
        );
    }

    renderTitleTemplateEditor() {
        const { logStructure } = this.props;
        return (
            <InputGroup className="my-1">
                <InputGroup.Text style={{ height: 'inherit', width: 99 }}>
                    Title Template
                </InputGroup.Text>
                <TextEditor
                    isSingleLine
                    value={logStructure.titleTemplate}
                    options={new TypeaheadOptions({
                        prefixOptions: [getPartialItem(logStructure), ...logStructure.logKeys],
                        serverSideOptions: [{ name: 'log-topic' }, { name: 'log-structure' }],
                    })}
                    disabled={this.props.disabled}
                    onChange={(titleTemplate) => this.updateLogStructure('titleTemplate', titleTemplate)}
                />
                <Button
                    className="log-structure-add-key"
                    disabled={this.props.disabled}
                    onClick={() => {
                        this.updateLogStructure((updatedLogStructure) => {
                            // eslint-disable-next-line no-param-reassign
                            updatedLogStructure.logKeys = [
                                ...updatedLogStructure.logKeys,
                                LogStructure.createNewKey(),
                            ];
                        });
                    }}
                    style={{ height: 'inherit' }}
                >
                    <MdAddCircleOutline />
                </Button>
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
        return (
            <>
                <div className="my-3">
                    {this.renderGroup()}
                    {this.renderName()}
                </div>
                <div className="my-3">
                    {this.renderTitleTemplateEditor()}
                    <SortableList
                        items={this.props.logStructure.logKeys}
                        disabled={this.props.disabled}
                        onChange={(logKeys) => {
                            this.updateLogStructure((updatedLogStructure) => {
                                // eslint-disable-next-line no-param-reassign
                                updatedLogStructure.logKeys = logKeys;
                            });
                        }}
                        onSearch={(query, index) => window.api.send('value-typeahead', {
                            logStructure: this.props.logStructure,
                            query,
                            index,
                        })}
                        type={LogStructureKeyEditor}
                        valueKey="logKey"
                        logStructure={this.props.logStructure}
                    />
                    {this.renderNeedsEditSelector()}
                    {this.renderAllowEventDetailsSelector()}
                </div>
                <div className="my-3">
                    <LogStructureFrequencyEditor
                        logStructure={this.props.logStructure}
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
