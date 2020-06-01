import React from 'react';
import PropTypes from './prop-types';
import LogKeyTypes from '../common/log_key_types';
import assert from '../common/assert';
import deepcopy from '../common/deepcopy';
import range from '../common/range';

import LeftRight from './LeftRight.react';
import {LogKeyListEditor} from './LogKey.react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';

class LogCategoryEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            category: props.category,
            creationId: 0,
            showDeleteDialog: false,
        };
    }
    componentDidUpdate(prevProps) {
        if (this.props != prevProps) {
            this.setState({category: this.props.category});
        }
    }
    render() {
        return (
            <>
                <InputGroup className="my-1" size="sm">
                    <InputGroup.Prepend>
                        <InputGroup.Text style={{width: 100}}>
                            {'Category'}
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        placeholder="Category Name"
                        type="text"
                        value={this.state.category.name}
                        onChange={event => this.onNameUpdate(event.target.value)}
                    />
                </InputGroup>
                <LogKeyListEditor
                    logKeys={this.state.category.logKeys}
                    onUpdate={logKeys => this.onLogKeysUpdate(logKeys)}
                />
                <LeftRight>
                    <Button
                        variant="secondary"
                        onClick={() => this.onKeyCreate()}
                        size="sm"
                        style={{width: 100}}>
                        {'Add Key'}
                    </Button>
                    <div>
                        {this.props.category.id > 0
                            ? <Button
                                className="ml-1"
                                onClick={() => this.setState({showDeleteDialog: true})}
                                size="sm"
                                style={{width: 80}}
                                variant="secondary">
                                {'Delete'}
                              </Button>
                            : null
                        }
                        <Button
                            className="ml-1"
                            onClick={() => this.setState({category: this.props.category})}
                            size="sm"
                            style={{width: 80}}
                            variant="secondary">
                            {'Reset'}
                        </Button>
                        <Button
                            className="ml-1"
                            onClick={() => this.props.onSave(this.state.category)}
                            size="sm"
                            style={{width: 80}}
                            variant="secondary">
                            {this.props.category.id > 0 ? 'Save' : 'Create'}
                        </Button>
                    </div>
                </LeftRight>
                {this.renderDeleteModal()}
            </>
        );
    }
    renderDeleteModal() {
        return (
            <Modal
                show={this.state.showDeleteDialog}
                onHide={() => this.setState({showDeleteDialog: false})}>
                <Modal.Header>
                    <Modal.Title>{this.state.category.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this category?</Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => this.setState({showDeleteDialog: false})}
                        variant="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => this.props.onDelete(this.state.category)}
                        variant="danger">
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
    onNameUpdate(value) {
        this.updateCategory(category => {
            category.name = value;
        });
    }
    onLogKeysUpdate(logKeys) {
        this.updateCategory(category => {
            category.logKeys = logKeys;
        });
    }
    createEmptyLogKey(state) {
        return {
            id: state.creationId,
            name: '',
            type: LogKeyTypes.STRING.value,
        }
    }
    onKeyCreate(index) {
        this.updateCategory((category, state) => {
            state.creationId -= 1;
            if (typeof index == "undefined") {
                index = category.logKeys.length;
            }
            category.logKeys[index] = this.createEmptyLogKey(state);
        });
    }
    updateCategory(method) {
        this.setState(state => {
            const category = deepcopy(state.category);
            method(category, state);
            return {category};
        });
    }
}

LogCategoryEditor.propTypes = {
    category: PropTypes.Custom.LogCategory.isRequired,
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

class LogCategoryList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newCategory: this.createEmptyLogCategory(),
            editCategory: null,
        };
    }
    createEmptyLogCategory() {
        return {
            id: -1,
            name: '',
            logKeys: [],
        };
    }
    componentDidMount() {
        this.reload();
    }
    reload() {
        window.api.send("log-category-list")
            .then(categories => this.setState({categories}));
    }
    render() {
        if (!this.state.categories) {
            return <div>{'Loading Categories ...'}</div>;
        }
        return (
            <div>
                <LeftRight className="mt-2">
                    <span />
                    <Button
                        onClick={() => this.setState({editCategory: this.createEmptyLogCategory()})}
                        size="sm"
                        variant="secondary">
                        Create
                    </Button>
                </LeftRight>
                {this.state.categories.map(category => this.renderCategory(category))}
                {this.renderEditorModal()}
            </div>
        )
    }
    renderCategory(category, index) {
        return (
            <Card key={category.id} className="p-2 mt-2">
                <LeftRight>
                    <div>
                        <b>{category.name}</b>
                        {category.logKeys.map(logKey =>
                            <Button
                                className="ml-2"
                                disabled={true}
                                key={logKey.id}
                                size="sm"
                                variant="secondary">
                                {logKey.name}
                            </Button>
                        )}
                    </div>
                    <Button
                        onClick={() => this.setState({editCategory: category})}
                        size="sm"
                        variant="secondary">
                        {'Edit'}
                    </Button>
                </LeftRight>
            </Card>
        );
    }
    renderEditorModal() {
        return (
            <Modal
                show={!!this.state.editCategory}
                size="lg"
                onHide={() => this.setState({editCategory: null})}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{'Category Editor'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.state.editCategory
                        ? <LogCategoryEditor
                            category={this.state.editCategory}
                            onSave={category => this.onSave(category)}
                            onDelete={category => this.onDelete(category)}
                        />
                        : null}
                </Modal.Body>
            </Modal>
        );
    }
    onSave(category) {
        this.setState({editCategory: null});
        window.api.send("log-category-upsert", category)
            .then(_ => this.reload());
    }
    onDelete(category) {
        this.setState({editCategory: null});
        window.api.send("log-category-delete", category)
            .then(_ => this.reload());
    }
}

export {LogCategoryList};
