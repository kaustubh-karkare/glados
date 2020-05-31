import React from 'react';
import Dropdown from './Dropdown.react';
import PropTypes from './prop-types';
import LSDValueTypes from '../common/lsd_value_types';
import assert from '../common/assert';
import deepcopy from '../common/deepcopy';
import range from '../common/range';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import arrayMove from 'array-move';

const DragHandle = SortableHandle(({children}) => <span>{children}</span>);

class LSDKeyEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isLoading: false, options: []};
    }
    render() {
        return (
            <div>
                <DragHandle>
                    <span className="drag-handle form-element">{'⋮'}</span>
                </DragHandle>
                <div style={{display: 'inline-block'}}>
                    <AsyncTypeahead
                        {...this.state}
                        id="key_name"
                        labelKey="name"
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
                </div>
                <Dropdown
                    options={Object.values(LSDValueTypes)}
                    value={this.props.lsdKey.valueType}
                    onChange={event => this.onUpdate('valueType', event.target.value)}
                    disabled={this.props.lsdKey.id > 0}
                />
                <input
                    type='button'
                    value='Delete'
                    onClick={this.props.onDelete}
                />
            </div>
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
            <div>
                <div>
                    <input
                        type='input'
                        placeholder='Category Name'
                        value={this.state.category.name}
                        onChange={event => {
                            const name = event.target.value;
                            this.setState(state => {
                                const category = {...state.category};
                                category.name = name;
                                return {category};
                            });
                        }}
                    />
                </div>
                <SortableList
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
                <input
                    type='button'
                    value='Add Key'
                    onClick={() => this.onCreate()}
                />
                <input
                    type='button'
                    value='Reset'
                    onClick={() => this.setState({category: this.props.category})}
                />
                <input
                    type='button'
                    value='Save'
                />
            </div>
        );
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
            if (typeof index == "undefined") {
                index = category.lsdKeys.length;
            }
            state.creationId -= 1;
            category.lsdKeys[index] = {
                id: state.creationId,
                name: '',
                valueType: LSDValueTypes.STRING.value,
            };
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

CategoryEditor.defaultProps = {
    category: {
        id: 1,
        name: 'Animal',
        lsdKeys: [
            {id: 2, name: 'Size', valueType: 'string'},
            {id: 3, name: 'Legs aksjhdkashdklakhjsda', valueType: 'integer'},
            {id: -10000, name: '', valueType: 'integer'},
        ],
    },
};

export default CategoryEditor;
