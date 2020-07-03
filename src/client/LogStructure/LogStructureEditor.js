import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import PropTypes from '../prop-types';
import deepcopy from '../../common/deepcopy';
import { SortableList, TextInput, TextEditor } from '../Common';
import { LogKeyEditor } from '../LogKey';
import { LogKey } from '../../data';

class LogStructureEditor extends React.Component {
    updateLogStructure(method) {
        const logStructure = deepcopy(this.props.logStructure);
        method(logStructure);
        this.props.onChange(logStructure);
    }

    render() {
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text style={{ width: 100 }}>
                        Name
                    </InputGroup.Text>
                    <TextInput
                        value={this.props.logStructure.name}
                        disabled={this.props.disabled}
                        onChange={(newName) => {
                            this.updateLogStructure((structure) => {
                                // eslint-disable-next-line no-param-reassign
                                structure.name = newName;
                            });
                        }}
                    />
                    <Button
                        disabled={this.props.disabled}
                        onClick={() => {
                            this.updateLogStructure((structure) => {
                                // eslint-disable-next-line no-param-reassign
                                structure.logKeys.push(LogKey.createVirtual());
                            });
                        }}
                        size="sm"
                        variant="secondary"
                    >
                        <MdAddCircleOutline />
                    </Button>
                </InputGroup>
                <SortableList
                    items={this.props.logStructure.logKeys}
                    onChange={(logKeys) => {
                        this.updateLogStructure((structure) => {
                            // eslint-disable-next-line no-param-reassign
                            structure.logKeys = logKeys;
                        });
                    }}
                    type={LogKeyEditor}
                    valueKey="logKey"
                />
                <InputGroup className="my-1">
                    <InputGroup.Text style={{ height: 'inherit', width: 99 }}>
                        Title Template
                    </InputGroup.Text>
                    <TextEditor
                        isSingleLine
                        value={this.props.logStructure.titleTemplate}
                        clientSideOptions={this.props.logStructure.logKeys}
                        serverSideTypes={['log-topic']}
                        disabled={this.props.disabled}
                        onChange={(value) => this.updateLogStructure((logStructure) => {
                            // eslint-disable-next-line no-param-reassign
                            logStructure.titleTemplate = value;
                        })}
                    />
                </InputGroup>
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
