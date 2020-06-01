import React from 'react';
import PropTypes from './prop-types';
import LSDValueTypes from '../common/lsd_value_types';
import assert from '../common/assert';
import deepcopy from '../common/deepcopy';
import range from '../common/range';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import arrayMove from 'array-move';

import LeftRight from './LeftRight.react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Collapse from 'react-bootstrap/Collapse';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';

const DragHandle = SortableHandle(({children}) => <>{children}</>);

class LSDKeyEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isLoading: false, options: []};
    }
    render() {
        return (
            <InputGroup className="mb-1" size="sm">
                <InputGroup.Prepend>
                    <DragHandle>
                        <InputGroup.Text style={{cursor: 'grab'}}>
                            {'⋮'}
                        </InputGroup.Text>
                    </DragHandle>
                    <DropdownButton
                        as={ButtonGroup}
                        className=""
                        disabled={this.props.lsdKey.id > 0}
                        onSelect={() => null}
                        size="sm"
                        title={this.props.lsdKey.valueType}
                        variant="secondary">
                        {Object.values(LSDValueTypes).map(item =>
                            <Dropdown.Item
                                key={item.value}
                                onMouseDown={() => this.onUpdate('valueType', item.value)}>
                                {item.label}
                            </Dropdown.Item>
                        )}
                    </DropdownButton>
                </InputGroup.Prepend>
                <AsyncTypeahead
                    {...this.state}
                    id="key_name"
                    labelKey="name"
                    size="small"
                    minLength={1}
                    disabled={this.props.lsdKey.id > 0}
                    onSearch={query => {
                        this.setState({isLoading: true}, () => {
                            window.api.send("lsd-key-typeahead")
                                .then(options => this.setState({isLoading: false, options}));
                        });
                    }}
                    filterBy={this.props.filterBy}
                    placeholder='Key Name'
                    selected={[this.props.lsdKey.name]}
                    onInputChange={value => this.onUpdate('name', value)}
                    onChange={selected => {
                        if (selected.length) {
                            this.props.onUpdate(selected[0]);
                        }
                    }}
                    renderMenuItemChildren={(option, props, index) => {
                        return <div onMouseDown={() => this.props.onUpdate(option)}>{option.name}</div>;
                    }}
                />
                <InputGroup.Append>
                    <Button
                        onClick={this.props.onDelete}
                        size="sm"
                        variant="secondary">
                        {'🗑'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        );
    }
    onUpdate(name, value) {
        const lsdKey = {...this.props.lsdKey};
        lsdKey[name] = value;
        this.props.onUpdate(lsdKey);
    }
}

LSDKeyEditor.propTypes = {
    total: PropTypes.number.isRequired,
    lsdKey: PropTypes.Custom.LSDKey.isRequired,
    filterBy: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

const LSDKeyEditorSortableItem = SortableElement(LSDKeyEditor);

const SortableList = SortableContainer(({children}) => {
  return <div>{children}</div>;
});

class CategoryEditor extends React.Component {
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
                <SortableList
                    useDragHandle={true}
                    onSortEnd={this.onKeyReorder.bind(this)}>
                    {this.state.category.lsdKeys.map((lsdKey, index, list) =>
                        <LSDKeyEditorSortableItem
                            key={lsdKey.id}
                            index={index}
                            total={list.length}
                            lsdKey={lsdKey}
                            filterBy={this.filterBy.bind(this, index)}
                            onUpdate={this.onKeyUpdate.bind(this, index)}
                            onDelete={this.onKeyDelete.bind(this, index)}
                        />
                    )}
                </SortableList>
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
    filterBy(index, option) {
        const lsdKey = this.state.category.lsdKeys[index];
        return (
            this.state.category.lsdKeys
                .filter((_, itemIndex) => (index != itemIndex))
                .every(lsdKey => option.id != lsdKey.id) &&
            option.name.includes(lsdKey.name)
        );
    }
    onKeyCreate(index) {
        this.updateCategory((category, state) => {
            state.creationId -= 1;
            const newItem = {
                id: state.creationId,
                name: '',
                valueType: LSDValueTypes.STRING.value,
            };
            if (typeof index == "undefined") {
                index = category.lsdKeys.length;
            }
            category.lsdKeys[index] = newItem;
        });
    }
    onKeyUpdate(index, data) {
        if (data == null) {
            this.onKeyCreate(index);
            return;
        }
        this.updateCategory(category => {
            category.lsdKeys[index] = data;
        });
    }
    onKeyDelete(index) {
        this.updateCategory(category => {
            category.lsdKeys.splice(index, 1);
        });
    }
    onKeyReorder({oldIndex, newIndex}) {
        this.updateCategory(category => {
            category.lsdKeys = arrayMove(category.lsdKeys, oldIndex, newIndex);
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

CategoryEditor.propTypes = {
    category: PropTypes.Custom.Category.isRequired,
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

class CategoryList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newCategory: this.createEmptyCategory(),
            editCategory: null,
        };
    }
    createEmptyCategory() {
        return {
            id: -1,
            name: '',
            lsdKeys: [],
        };
    }
    componentDidMount() {
        this.reload();
    }
    reload() {
        window.api.send("category-list")
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
                        onClick={() => this.setState({editCategory: this.createEmptyCategory()})}
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
                        {category.lsdKeys.map(lsdKey =>
                            <Button
                                className="ml-2"
                                disabled={true}
                                key={lsdKey.id}
                                size="sm"
                                variant="secondary">
                                {lsdKey.name}
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
                        ? <CategoryEditor
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
        window.api.send("category-update", category)
            .then(_ => this.reload());
    }
    onDelete(category) {
        this.setState({editCategory: null});
        window.api.send("category-delete", category)
            .then(_ => this.reload());
    }
}

export {CategoryList};
