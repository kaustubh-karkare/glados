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
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Group
                </InputGroup.Text>
                <TypeaheadSelector
                    id="log-structure-editor-structure-group"
                    serverSideTypes={['log-structure-group']}
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
                    disabled={this.props.disabled}
                    onClick={() => {
                        this.updateLogStructure((updatedLogStructure) => {
                            const index = updatedLogStructure.logKeys.length;
                            // eslint-disable-next-line no-param-reassign
                            updatedLogStructure.logKeys = [
                                ...updatedLogStructure.logKeys,
                                LogStructure.createNewKey({ index }),
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

    renderIsMajorSelector() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Is Major?
                </InputGroup.Text>
                <Selector.Binary
                    value={this.props.logStructure.isMajor}
                    disabled={this.props.disabled}
                    onChange={(isMajor) => this.updateLogStructure('isMajor', isMajor)}
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
                        type={LogStructureKeyEditor}
                        valueKey="logKey"
                    />
                    {this.renderNeedsEditSelector()}
                </div>
                <div className="my-3">
                    <LogStructureFrequencyEditor
                        logStructure={this.props.logStructure}
                        disabled={this.props.disabled}
                        updateLogStructure={(...args) => this.updateLogStructure(...args)}
                    />
                </div>
                <div className="my-3">
                    {this.renderIsMajorSelector()}
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
