import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';
import Modal from 'react-bootstrap/Modal';
import PropTypes from '../prop-types';
import deepcopy from '../../common/deepcopy';

import { LeftRight } from '../Common';
import { LogKeyListEditor } from '../LogKey';
import { TextEditor } from '../Common';

import { createEmptyLogKey } from '../Data';

class LogCategoryEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            category: props.category,
            showDeleteDialog: false,
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            this.setState({ category: this.props.category });
        }
    }

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

    onKeyCreate(index) {
        this.updateCategory((category) => {
            if (typeof index === 'undefined') {
                // eslint-disable-next-line no-param-reassign
                index = category.logKeys.length;
            }
            // eslint-disable-next-line no-param-reassign
            category.logKeys[index] = createEmptyLogKey();
        });
    }

    updateCategory(method) {
        this.setState((state) => {
            const category = deepcopy(state.category);
            method(category, state);
            return { category };
        });
    }

    renderDeleteModal() {
        return (
            <Modal
                show={this.state.showDeleteDialog}
                onHide={() => this.setState({ showDeleteDialog: false })}
            >
                <Modal.Header>
                    <Modal.Title>{this.state.category.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this category?</Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => this.setState({ showDeleteDialog: false })}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => this.props.onDelete(this.state.category)}
                        variant="danger"
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    render() {
        return (
            <>
                <InputGroup className="my-1" size="sm">
                    <InputGroup.Prepend>
                        <InputGroup.Text style={{ width: 100 }}>
                            Category
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        placeholder="Category Name"
                        type="text"
                        value={this.state.category.name}
                        onChange={(event) => this.onNameUpdate(event.target.value)}
                    />
                    <InputGroup.Append>
                        <Button
                            onClick={() => this.onKeyCreate()}
                            variant="secondary"
                        >
                            <MdAddCircleOutline />
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
                <LogKeyListEditor
                    logKeys={this.state.category.logKeys}
                    onUpdate={(logKeys) => this.onLogKeysUpdate(logKeys)}
                />
                <InputGroup className="my-1" size="sm">
                    <InputGroup.Prepend>
                        <InputGroup.Text style={{ width: 100 }}>
                            Template
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <TextEditor
                        value={this.state.category.template}
                        suggestions={[
                            {trigger: '@', source: this.state.category.logKeys},
                        ]}
                        onUpdate={(value) => this.updateCategory((category) => {
                            // eslint-disable-next-line no-param-reassign
                            category.template = value;
                        })}
                    />
                </InputGroup>
                <LeftRight>
                    <div />
                    <div>
                        {this.props.category.id > 0
                            ? (
                                <Button
                                    className="ml-1"
                                    onClick={() => this.setState({ showDeleteDialog: true })}
                                    size="sm"
                                    style={{ width: 80 }}
                                    variant="secondary"
                                >
                                    Delete
                                </Button>
                            )
                            : null}
                        <Button
                            className="ml-1"
                            onClick={() => this.setState({ category: this.props.category })}
                            size="sm"
                            style={{ width: 80 }}
                            variant="secondary"
                        >
                            Reset
                        </Button>
                        <Button
                            className="ml-1"
                            onClick={() => this.props.onSave(this.state.category)}
                            size="sm"
                            style={{ width: 80 }}
                            variant="secondary"
                        >
                            {this.props.category.id > 0 ? 'Save' : 'Create'}
                        </Button>
                    </div>
                </LeftRight>
                {this.renderDeleteModal()}
            </>
        );
    }
}

LogCategoryEditor.propTypes = {
    category: PropTypes.Custom.LogCategory.isRequired,
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default LogCategoryEditor;
