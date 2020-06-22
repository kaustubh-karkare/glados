import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import PropTypes from '../prop-types';
import deepcopy from '../../common/deepcopy';
import { TextEditor } from '../Common';
import { LogKeyListEditor } from '../LogKey';
import { LogKey } from '../../data';

class LogCategoryEditor extends React.Component {
    onNameUpdate(value) {
        this.updateCategory((category) => {
            // eslint-disable-next-line no-param-reassign
            category.name = value;
        });
    }

    onLogKeysUpdate(logKeys) {
        this.updateCategory((category) => {
            // eslint-disable-next-line no-param-reassign
            category.logKeys = logKeys;
        });
    }

    onKeyCreate() {
        this.updateCategory((category) => {
            // eslint-disable-next-line no-param-reassign
            category.logKeys.push(LogKey.createEmpty());
        });
    }

    updateCategory(method) {
        const logCategory = deepcopy(this.props.logCategory);
        method(logCategory);
        this.props.onChange(logCategory);
    }

    render() {
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text style={{ width: 100 }}>
                        Category
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Category Name"
                        type="text"
                        value={this.props.logCategory.name}
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
                <LogKeyListEditor
                    logKeys={this.props.logCategory.logKeys}
                    onUpdate={(logKeys) => this.onLogKeysUpdate(logKeys)}
                />
                <InputGroup className="my-1">
                    <InputGroup.Text style={{ height: 'inherit', width: 99 }}>
                        Template
                    </InputGroup.Text>
                    <TextEditor
                        isSingleLine
                        value={this.props.logCategory.template}
                        sources={[
                            { trigger: '@', options: this.props.logCategory.logKeys },
                        ]}
                        onUpdate={(value) => this.updateCategory((category) => {
                            // eslint-disable-next-line no-param-reassign
                            category.template = value;
                        })}
                    />
                </InputGroup>
            </>
        );
    }
}

LogCategoryEditor.propTypes = {
    logCategory: PropTypes.Custom.LogCategory.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogCategoryEditor;
