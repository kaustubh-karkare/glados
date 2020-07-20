import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import PropTypes from '../prop-types';
import deepcopy from '../../common/deepcopy';
import { maybeSubstitute } from '../../common/DateUtils';
import {
    DatePicker, SortableList, Selector, TextEditor, TextInput, TypeaheadSelector,
} from '../Common';
import LogStructureKeyEditor from './LogStructureKeyEditor';
import { LogStructure } from '../../data';

class LogStructureEditor extends React.Component {
    updateLogStructure(methodOrName, maybeValue) {
        const updatedLogStructure = deepcopy(this.props.logStructure);
        if (typeof methodOrName === 'function') {
            methodOrName(updatedLogStructure);
        } else {
            updatedLogStructure[methodOrName] = maybeValue;
        }
        LogStructure.trigger(updatedLogStructure);
        this.props.onChange(updatedLogStructure);
    }

    updateIsPeriodic(newValue) {
        this.updateLogStructure((updatedLogStructure) => {
            if (newValue) {
                updatedLogStructure.isPeriodic = true;
                updatedLogStructure.reminderText = updatedLogStructure._reminderText || '';
                updatedLogStructure.frequency = (
                    updatedLogStructure._frequency || LogStructure.FrequencyType.EVERYDAY
                );
                updatedLogStructure.lastUpdate = updatedLogStructure._lastUpdate || '{yesterday}';
                maybeSubstitute(updatedLogStructure, 'lastUpdate');
            } else {
                updatedLogStructure.isPeriodic = false;
                updatedLogStructure._reminderText = updatedLogStructure.reminderText;
                updatedLogStructure.reminderText = null;
                updatedLogStructure._frequency = updatedLogStructure.frequency;
                updatedLogStructure.frequency = null;
                updatedLogStructure._lastUpdate = updatedLogStructure.lastUpdate;
                updatedLogStructure.lastUpdate = null;
            }
        });
    }

    renderName() {
        const { logTopic } = this.props.logStructure;
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup className="my-1">
                        <InputGroup.Text>
                            Group
                        </InputGroup.Text>
                        <TypeaheadSelector
                            dataType="log-structure-group"
                            value={this.props.logStructure.logStructureGroup}
                            disabled={this.props.disabled}
                            onChange={(logStructureGroup) => this.updateLogTopic('logStructureGroup', logStructureGroup)}
                        />
                    </InputGroup>
                    <InputGroup.Text>
                        Name
                    </InputGroup.Text>
                    <TextInput
                        allowUpdate
                        dataType="log-topic"
                        value={logTopic.name}
                        disabled={this.props.disabled}
                        onChange={(newName) => this.updateLogStructure((updatedLogStructure) => {
                            updatedLogStructure.logTopic.name = newName;
                        })}
                    />
                </InputGroup>
            </>
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
                    clientSideOptions={[logStructure.logTopic, ...logStructure.logKeys]}
                    disabled={this.props.disabled}
                    onChange={(titleTemplate) => this.updateLogStructure('titleTemplate', titleTemplate)}
                />
                <Button
                    disabled={this.props.disabled}
                    onClick={() => {
                        this.updateLogStructure((updatedLogStructure) => {
                            const index = updatedLogStructure.logKeys.length;
                            // eslint-disable-next-line no-param-reassign
                            updatedLogStructure.logKeys.push(LogStructure.createNewKey({ index }));
                        });
                    }}
                    size="sm"
                    style={{ height: 'inherit' }}
                    variant="secondary"
                >
                    <MdAddCircleOutline />
                </Button>
            </InputGroup>
        );
    }

    renderPeriodicDetails() {
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Reminder Text
                    </InputGroup.Text>
                    <TextInput
                        value={this.props.logStructure.reminderText}
                        disabled={this.props.disabled}
                        onChange={(reminderText) => this.updateLogStructure('reminderText', reminderText)}
                    />
                </InputGroup>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Frequency
                    </InputGroup.Text>
                    <Selector
                        value={this.props.logStructure.frequency}
                        options={LogStructure.FrequencyOptions}
                        disabled={this.props.disabled}
                        onChange={(frequency) => this.updateLogStructure('frequency', frequency)}
                    />
                </InputGroup>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Last Update
                    </InputGroup.Text>
                    <DatePicker
                        value={this.props.logStructure.lastUpdate}
                        disabled={this.props.disabled}
                        onChange={(lastUpdate) => this.updateLogStructure('lastUpdate', lastUpdate)}
                    />
                </InputGroup>
            </>
        );
    }

    renderPeriodic() {
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Is Periodic?
                    </InputGroup.Text>
                    <Selector.Binary
                        value={this.props.logStructure.isPeriodic}
                        disabled={this.props.disabled}
                        onChange={(isPeriodic) => this.updateIsPeriodic(isPeriodic)}
                    />
                </InputGroup>
                {this.props.logStructure.isPeriodic ? this.renderPeriodicDetails() : null}
            </>
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
                    {this.renderName()}
                </div>
                <div className="my-3">
                    {this.renderTitleTemplateEditor()}
                    <SortableList
                        items={this.props.logStructure.logKeys}
                        disabled={this.props.disabled}
                        onChange={(logKeys) => {
                            this.updateLogStructure((structure) => {
                                // eslint-disable-next-line no-param-reassign
                                structure.logKeys = logKeys;
                            });
                        }}
                        type={LogStructureKeyEditor}
                        valueKey="logKey"
                    />
                </div>
                <div className="my-3">
                    {this.renderPeriodic()}
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
