import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import PropTypes from '../prop-types';
import deepcopy from '../../common/deepcopy';
import { SortableList, TextEditor } from '../Common';
import { LogKeyEditor } from '../LogKey';
import { LogKey } from '../../data';

class LogStructureEditor extends React.Component {
    onNameUpdate(value) {
        this.updateStructure((structure) => {
            // eslint-disable-next-line no-param-reassign
            structure.name = value;
        });
    }

    onLogKeysUpdate(logKeys) {
        this.updateStructure((structure) => {
            // eslint-disable-next-line no-param-reassign
            structure.logKeys = logKeys;
        });
    }

    onKeyCreate() {
        this.updateStructure((structure) => {
            // eslint-disable-next-line no-param-reassign
            structure.logKeys.push(LogKey.createVirtual());
        });
    }

    updateStructure(method) {
        const logStructure = deepcopy(this.props.logStructure);
        method(logStructure);
        this.props.onChange(logStructure);
    }

    render() {
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text style={{ width: 100 }}>
                        Structure
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Structure Name"
                        type="text"
                        value={this.props.logStructure.name}
                        onChange={(event) => this.onNameUpdate(event.target.value)}
                    />
                    <Button
                        onClick={() => this.onKeyCreate()}
                        size="sm"
                        variant="secondary"
                    >
                        <MdAddCircleOutline />
                    </Button>
                </InputGroup>
                <SortableList
                    items={this.props.logStructure.logKeys}
                    onChange={(logKeys) => this.onLogKeysUpdate(logKeys)}
                    type={LogKeyEditor}
                />
                <InputGroup className="my-1">
                    <InputGroup.Text style={{ height: 'inherit', width: 99 }}>
                        Title Template
                    </InputGroup.Text>
                    <TextEditor
                        isSingleLine
                        value={this.props.logStructure.titleTemplate}
                        sources={[
                            { trigger: '@', options: this.props.logStructure.logKeys },
                        ]}
                        onUpdate={(value) => this.updateStructure((structure) => {
                            // eslint-disable-next-line no-param-reassign
                            structure.titleTemplate = value;
                        })}
                    />
                </InputGroup>
            </>
        );
    }
}

LogStructureEditor.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogStructureEditor;