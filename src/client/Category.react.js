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
                        onSelect={() => console.info(arguments)}
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
                            window.api.send("category-typeahead")
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
        };
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
                        onChange={event => this.onUpdateName(event.target.value)}
                    />
                </InputGroup>
                <SortableList
                    useDragHandle={true}
                    onSortEnd={this.onReorder.bind(this)}>
                    {this.state.category.lsdKeys.map((lsdKey, index, list) =>
                        <LSDKeyEditorSortableItem
                            key={lsdKey.id}
                            index={index}
                            total={list.length}
                            lsdKey={lsdKey}
                            filterBy={this.filterBy.bind(this, index)}
                            onUpdate={this.onUpdate.bind(this, index)}
                            onDelete={this.onDelete.bind(this, index)}
                        />
                    )}
                </SortableList>
                <LeftRight>
                    <Button
                        variant="secondary"
                        onClick={() => this.onCreate()}
                        size="sm"
                        style={{width: 100}}>
                        {'Add Key'}
                    </Button>
                    <div>
                        <Button
                            className="mr-1"
                            onClick={() => this.setState({category: this.props.category})}
                            size="sm"
                            style={{width: 95}}
                            variant="success">
                            {'Reset'}
                        </Button>
                        <Button
                            size="sm"
                            style={{width: 82}}
                            variant="success">
                            {this.state.category.id < 0 ? 'Create' : 'Save'}
                        </Button>
                    </div>
                </LeftRight>
            </>
        );
    }
    onUpdateName(value) {
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
    onCreate(index) {
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
    onUpdate(index, data) {
        if (data == null) {
            this.onCreate(index);
            return;
        }
        this.updateCategory(category => {
            category.lsdKeys[index] = data;
        });
    }
    onDelete(index) {
        this.updateCategory(category => {
            category.lsdKeys.splice(index, 1);
        });
    }
    onReorder({oldIndex, newIndex}) {
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
    category: PropTypes.Custom.Category,
};

class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {edit: false};
    }
    render() {
        return (
            <Card className="p-2">
                <LeftRight>
                    <div>
                        <b>{this.props.category.name}</b>
                        {this.props.category.lsdKeys.map(lsdKey =>
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
                    <Form.Check
                        aria-controls="category-editor"
                        type="switch"
                        id="edit-mode"
                        label="Edit"
                        value={this.state.edit}
                        onClick={() => this.setState({edit: !this.state.edit})}
                    />
                </LeftRight>
                <Collapse in={this.state.edit} unmountOnExit={true}>
                    <div id="category-editor">
                        <CategoryEditor category={this.props.category} />
                    </div>
                </Collapse>
            </Card>
        );
    }
}

Category.propTypes = {
    category: PropTypes.Custom.Category,
};

Category.defaultProps = {
    category: {
        id: -1,
        name: 'Animal',
        lsdKeys: [
            {id: 2, name: 'Size', valueType: 'string'},
            {id: 3, name: 'Legs', valueType: 'integer'},
            {id: -10000, name: '', valueType: 'integer'},
        ],
    },
};

export default Category;
